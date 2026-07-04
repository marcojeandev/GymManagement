<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use App\Http\Requests\Admin\MembersRequest;
use App\Models\Member;
use App\Models\MembershipFee;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MembersController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request)
    {
        try {
            $this->authorize('viewAny', Member::class);

            $query = Member::query();

            if ($request->has('search') && !empty($request->search)) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('firstname', 'LIKE', "%{$search}%")
                    ->orWhere('lastname', 'LIKE', "%{$search}%")
                    ->orWhere('email', 'LIKE', "%{$search}%")
                    ->orWhere('contact', 'LIKE', "%{$search}%");
                });
            }

            if ($request->has('sex') && in_array($request->sex, ['male', 'female'])) {
                $query->where('sex', $request->sex);
            }

            if ($request->has('membership_status')) {
                $query->where('membership_status', $request->membership_status);
            }

            $members = $query->latest()->paginate($request->per_page ?? 15);
            $members->load('membershipFee');

            return response()->json([
                'status' => 1,
                'data' => $members
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Server error.'
            ], 500);
        }
    }

    public function show(Member $member)
    {
        try {
            $this->authorize('view', $member);

            $member->load('membershipFee');

            return response()->json([
                'status' => 1,
                'data' => $member
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Server error.'
            ], 500);
        }
    }

    public function store(MembersRequest $request)
    {
        try {
            $validated = $request->validated();
            $this->authorize('create', Member::class);
            
            $validated["profile"] = $request->hasFile('profile') ?
                $request->file('profile')->store('profiles', 'public') : null;

            // For postman purpose
            // if ($request->hasFile('profile')) {
            //     $path = $request->file('profile')->store('profiles', 'public');
            //     $validated['profile'] = $path;
            // } else {
            //     $defaultPath = public_path('sample/iori.jpg');
            //     if (file_exists($defaultPath)) {
            //         $filename = 'profiles/default_' . uniqid() . '.jpg';
            //         Storage::disk('public')->put($filename, file_get_contents($defaultPath));
            //         $validated['profile'] = $filename;
            //     } else {
            //         $validated['profile'] = null; 
            //     }
            // }

            $validated['qr_code'] = $this->generateQRCode();

            $member = Member::create($validated);

            if (!empty($validated['membership_id'])) {
                $member->membershipFee()->create([
                    'membership_id' => $validated['membership_id'],
                    'payment_type' => $validated['payment_type'] ?? 'cash',
                    'payment_amount' => $validated['payment_amount'] ?? null,
                    'or_number' => $validated['or_number'] ?? null,
                    'transaction_id' => $validated['transaction_id'] ?? null,
                    'payment_status' => $validated['payment_status'] ?? 'pending',
                    'paid_at' => $validated['paid_at'] ?? null,
                ]);
            }

            return response()->json([
                'status' => 1,
                'message' => 'Member created successfully.',
                'data' => $member->load('membershipFee')
            ], 201);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Server error: ' . $e->getMessage()
            ], 500);
        }
    }

    public function update(MembersRequest $request, Member $member)
    {
        try {
            $this->authorize('update', $member);

            $validated = $request->validated();

            if (!empty($validated['password'])) {
                $validated['password'] = Hash::make($validated['password']);
            } else {
                unset($validated['password']);
            }

            if ($request->hasFile('profile')) {
                if ($member->profile && Storage::disk('public')->exists($member->profile)) {
                    Storage::disk('public')->delete($member->profile);
                }
                $path = $request->file('profile')->store('profiles', 'public');
                $validated['profile'] = $path;
            } else {
                unset($validated['profile']);
            }

            $member->update($validated);

            if (!empty($validated['membership_id'])) {
                $feeData = [
                    'membership_id' => $validated['membership_id'],
                    'payment_type' => $validated['payment_type'] ?? 'cash',
                    'payment_amount' => $validated['payment_amount'] ?? null,
                    'or_number' => $validated['or_number'] ?? null,
                    'transaction_id' => $validated['transaction_id'] ?? null,
                    'payment_status' => $validated['payment_status'] ?? 'pending',
                    'paid_at' => $validated['paid_at'] ?? null,
                ];

                if ($member->membershipFee) {
                    $member->membershipFee->update($feeData);
                } else {
                    $feeData['members_id'] = $member->id;
                    $member->membershipFee()->create($feeData);
                }
            } 

            return response()->json([
                'status' => 1,
                'message' => 'Member updated successfully.',
                'data' => $member->load('membershipFee')
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Server error: ' . $e->getMessage()
            ], 500);
        }
    }

    public function destroy(Member $member)
    {
        try {
            $this->authorize('delete', $member);

            if ($member->profile && Storage::disk('public')->exists($member->profile)) {
                Storage::disk('public')->delete($member->profile);
            }

            $member->delete();

            return response()->json([
                'status' => 1,
                'message' => 'Member deleted successfully.'
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Server error.'
            ], 500);
        }
    }

    private function generateQRCode(): string
    {
        return 'QR-' . strtoupper(Str::random(10));
    }
}