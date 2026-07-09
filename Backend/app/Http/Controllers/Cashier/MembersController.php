<?php

namespace App\Http\Controllers\Cashier;

use App\Http\Controllers\Controller;
use App\Http\Requests\Cashier\MembersRequest;
use App\Models\Member;
use App\Models\MembershipFee;
use App\Models\GymSetting;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class MembersController extends Controller
{
    use AuthorizesRequests;

    /**
     * Display a paginated list of members with optional filters.
     */
    public function index(Request $request)
    {
        try {
            $this->authorize('viewAny', Member::class);

            $query = Member::query();

            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('firstname', 'LIKE', "%{$search}%")
                      ->orWhere('lastname', 'LIKE', "%{$search}%")
                      ->orWhere('email', 'LIKE', "%{$search}%")
                      ->orWhere('contact', 'LIKE', "%{$search}%");
                });
            }

            if ($request->filled('sex') && in_array($request->sex, ['male', 'female'])) {
                $query->where('sex', $request->sex);
            }

            if ($request->filled('membership_status')) {
                $query->where('membership_status', $request->membership_status);
            }

            $members = $query->latest()->paginate($request->per_page ?? 15);
            $members->load('membershipFee');

            return response()->json([
                'status' => 1,
                'data'   => $members,
            ]);
        } catch (\Throwable $e) {
            Log::error('Members index error: ' . $e->getMessage());
            return $this->errorResponse('Server error.');
        }
    }

    /**
     * Display the specified member.
     */
    public function show(Member $member)
    {
        try {
            $this->authorize('view', $member);
            $member->load('membershipFee');

            return response()->json([
                'status' => 1,
                'data'   => $member,
            ]);
        } catch (\Throwable $e) {
            Log::error('Member show error: ' . $e->getMessage());
            return $this->errorResponse('Server error.');
        }
    }

    /**
     * Store a newly created member.
     */
    public function store(MembersRequest $request)
    {
        try {
            $this->authorize('create', Member::class);
            $validated = $request->validated();

            // Handle profile image
            $validated['profile'] = $this->handleProfileUpload($request);

            // Generate QR code
            $validated['qr_code'] = $this->generateQRCode();

            // Create member
            $member = Member::create($validated);

            // Create membership fee if provided
            $this->createMembershipFee($member, $validated);

            // Send QR code email
            $this->sendQRCodeEmail($member);

            return response()->json([
                'status'  => 1,
                'message' => 'Member created successfully. QR code sent to email.',
                'data'    => $member->load('membershipFee'),
            ], 201);
        } catch (\Throwable $e) {
            Log::error('Member store error: ' . $e->getMessage());
            return $this->errorResponse('Server error: ' . $e->getMessage());
        }
    }

    /**
     * Update the specified member.
     */
    public function update(MembersRequest $request, Member $member)
    {
        try {
            $this->authorize('update', $member);
            $validated = $request->validated();

            // Handle password (if provided)
            if (!empty($validated['password'])) {
                $validated['password'] = Hash::make($validated['password']);
            } else {
                unset($validated['password']);
            }

            // Handle profile image
            if ($request->hasFile('profile')) {
                $this->deleteOldProfile($member);
                $validated['profile'] = $request->file('profile')->store('profiles', 'public');
            } else {
                unset($validated['profile']);
            }

            // Update member
            $member->update($validated);

            // Update or create membership fee
            $this->updateMembershipFee($member, $validated);

            return response()->json([
                'status'  => 1,
                'message' => 'Member updated successfully.',
                'data'    => $member->load('membershipFee'),
            ]);
        } catch (\Throwable $e) {
            Log::error('Member update error: ' . $e->getMessage());
            return $this->errorResponse('Server error: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified member.
     */
    public function destroy(Member $member)
    {
        try {
            $this->authorize('delete', $member);
            $this->deleteOldProfile($member);
            $member->delete();

            return response()->json([
                'status'  => 1,
                'message' => 'Member deleted successfully.',
            ]);
        } catch (\Throwable $e) {
            Log::error('Member delete error: ' . $e->getMessage());
            return $this->errorResponse('Server error.');
        }
    }

    /**
     * Find a member by their QR code.
     */
    public function getByQR($qrCode)
    {
        try {
            $this->authorize('viewAny', Member::class);
            $member = Member::where('qr_code', $qrCode)->first();

            if (!$member) {
                return response()->json([
                    'status'  => 0,
                    'message' => 'Member not found.',
                ], 404);
            }

            return response()->json([
                'status' => 1,
                'data'   => $member->load('membershipFee'),
            ]);
        } catch (\Throwable $e) {
            Log::error('QR lookup error: ' . $e->getMessage());
            return $this->errorResponse('Server error.');
        }
    }

    /**
     * Resend QR code to member email.
     */
    public function resendQRCode($id)
    {
        try {
            $member = Member::findOrFail($id);
            $this->sendQRCodeEmail($member);

            return response()->json([
                'status' => 1,
                'message' => 'QR code resent successfully to ' . $member->email,
            ]);
        } catch (\Throwable $e) {
            Log::error('Resend QR error: ' . $e->getMessage());
            return $this->errorResponse('Failed to send QR code: ' . $e->getMessage());
        }
    }

    // ==================== PRIVATE HELPERS ====================

    /**
     * Generate a unique QR code string.
     */
    private function generateQRCode(): string
    {
        return 'QR-' . strtoupper(Str::random(10));
    }

    /**
     * Handle profile image upload.
     */
    private function handleProfileUpload(Request $request): ?string
    {
        if ($request->hasFile('profile')) {
            return $request->file('profile')->store('profiles', 'public');
        }
        return null;
    }

    /**
     * Delete old profile image if it exists.
     */
    private function deleteOldProfile(Member $member): void
    {
        if ($member->profile && Storage::disk('public')->exists($member->profile)) {
            Storage::disk('public')->delete($member->profile);
        }
    }

    /**
     * Create a membership fee record for a member.
     */
    private function createMembershipFee(Member $member, array $validated): void
    {
        if (!empty($validated['membership_id'])) {
            $member->membershipFee()->create([
                'membership_id'   => $validated['membership_id'],
                'payment_type'    => $validated['payment_type'] ?? 'cash',
                'payment_amount'  => $validated['payment_amount'] ?? null,
                'or_number'       => $validated['or_number'] ?? null,
                'transaction_id'  => $validated['transaction_id'] ?? null,
                'payment_status'  => $validated['payment_status'] ?? 'pending',
                'paid_at'         => $validated['paid_at'] ?? null,
            ]);
        }
    }

    /**
     * Update or create a membership fee for a member.
     */
    private function updateMembershipFee(Member $member, array $validated): void
    {
        if (!empty($validated['membership_id'])) {
            $feeData = [
                'membership_id'   => $validated['membership_id'],
                'payment_type'    => $validated['payment_type'] ?? 'cash',
                'payment_amount'  => $validated['payment_amount'] ?? null,
                'or_number'       => $validated['or_number'] ?? null,
                'transaction_id'  => $validated['transaction_id'] ?? null,
                'payment_status'  => $validated['payment_status'] ?? 'pending',
                'paid_at'         => $validated['paid_at'] ?? null,
            ];

            if ($member->membershipFee) {
                $member->membershipFee->update($feeData);
            } else {
                $feeData['members_id'] = $member->id;
                $member->membershipFee()->create($feeData);
            }
        }
    }

    /**
     * Send QR code email to member with QR image (no imagick needed).
     */
    private function sendQRCodeEmail(Member $member): void
    {
        try {
            // Get gym settings
            $gym = GymSetting::first();
            $gymName = $gym->gym_name ?? 'Gym Management System';
            $gymEmail = $gym->email ?? 'info@gym.com';
            $gymContact = $gym->contact ?? 'N/A';
            
            // Get logo URL
            $gymLogo = null;
            if ($gym && $gym->logo) {
                $gymLogo = asset('storage/' . $gym->logo);
            }

            // ✅ Use free QR Code API (no imagick needed)
            $qrCodeUrl = "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=" . urlencode($member->qr_code);

            // Prepare email data
            $data = [
                'member' => $member,
                'gym_name' => $gymName,
                'gym_logo' => $gymLogo,
                'gym_email' => $gymEmail,
                'gym_contact' => $gymContact,
                'qr_code_url' => $qrCodeUrl,
                'qr_code' => $member->qr_code,
            ];

            // Send email
            Mail::send('emails.member-qr-code', $data, function ($message) use ($member, $gymName, $gymEmail) {
                $message->to($member->email, $member->firstname . ' ' . $member->lastname)
                        ->from($gymEmail, $gymName)
                        ->subject('Your Gym Membership QR Code - ' . $gymName);
            });

            Log::info('QR code email sent to: ' . $member->email);
        } catch (\Exception $e) {
            Log::error('Failed to send QR code email: ' . $e->getMessage());
            // Don't throw - member is still created, email is optional
        }
    }

    /**
     * Return a standardized error response.
     */
    private function errorResponse(string $message, int $status = 500): \Illuminate\Http\JsonResponse
    {
        return response()->json([
            'status'  => 0,
            'message' => $message,
        ], $status);
    }
}