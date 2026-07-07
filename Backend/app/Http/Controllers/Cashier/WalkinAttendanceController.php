<?php

namespace App\Http\Controllers\Cashier;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Requests\Cashier\WalkinAttendanceRequest;
use App\Models\WalkinAttendance;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class WalkinAttendanceController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request)
    {
        $this->authorize('viewAny', WalkinAttendance::class);

        $query = WalkinAttendance::with(['walkinInfo', 'member']);

        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->whereHas('walkinInfo', function ($q) use ($search) {
                    $q->where('firstname', 'LIKE', "%{$search}%")
                      ->orWhere('lastname', 'LIKE', "%{$search}%")
                      ->orWhere('email', 'LIKE', "%{$search}%")
                      ->orWhere('contact', 'LIKE', "%{$search}%");
                })->orWhereHas('member', function ($q) use ($search) {
                    $q->where('firstname', 'LIKE', "%{$search}%")
                      ->orWhere('lastname', 'LIKE', "%{$search}%")
                      ->orWhere('email', 'LIKE', "%{$search}%")
                      ->orWhere('qr_code', 'LIKE', "%{$search}%");
                });
            });
        }

        $attendances = $query->latest()->paginate($request->per_page ?? 15);

        return response()->json([
            'status' => 1,
            'data' => $attendances,
        ]);
    }

    public function show(WalkinAttendance $walkinAttendance)
    {
        $this->authorize('view', $walkinAttendance);
        $walkinAttendance->load(['walkinInfo', 'member']);
        return response()->json([
            'status' => 1,
            'data' => $walkinAttendance,
        ]);
    }

    public function store(WalkinAttendanceRequest $request)
    {
        $this->authorize('create', WalkinAttendance::class);

        $validated = $request->validated();

        // Ensure either walk_in_id or members_id is present
        if (empty($validated['walk_in_id']) && empty($validated['members_id'])) {
            return response()->json([
                'status' => 0,
                'message' => 'Either walk-in or member must be selected.',
            ], 422);
        }

        $attendance = WalkinAttendance::create($validated);

        return response()->json([
            'status' => 1,
            'message' => 'Walk-in attendance recorded.',
            'data' => $attendance->load(['walkinInfo', 'member']),
        ], 201);
    }

    public function update(WalkinAttendanceRequest $request, WalkinAttendance $walkinAttendance)
    {
        $this->authorize('update', $walkinAttendance);

        $validated = $request->validated();

        if (empty($validated['walk_in_id']) && empty($validated['members_id'])) {
            return response()->json([
                'status' => 0,
                'message' => 'Either walk-in or member must be selected.',
            ], 422);
        }

        $walkinAttendance->update($validated);

        return response()->json([
            'status' => 1,
            'message' => 'Walk-in attendance updated.',
            'data' => $walkinAttendance->load(['walkinInfo', 'member']),
        ]);
    }

    public function destroy(WalkinAttendance $walkinAttendance)
    {
        $this->authorize('delete', $walkinAttendance);

        $walkinAttendance->delete();

        return response()->json([
            'status' => 1,
            'message' => 'Walk-in attendance deleted.',
        ]);
    }
}