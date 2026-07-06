<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Requests\Admin\AttendanceRequest;
use App\Models\Attendance;
use App\Models\Member;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AttendanceController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request)
    {
        $this->authorize('viewAny', Attendance::class);

        $query = Attendance::with('member');

        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->whereHas('member', function ($q) use ($search) {
                $q->where('firstname', 'LIKE', "%{$search}%")
                  ->orWhere('lastname', 'LIKE', "%{$search}%")
                  ->orWhere('email', 'LIKE', "%{$search}%")
                  ->orWhere('qr_code', 'LIKE', "%{$search}%");
            });
        }

        if ($request->has('member_id') && !empty($request->member_id)) {
            $query->where('members_id', $request->member_id);
        }

        if ($request->has('date') && !empty($request->date)) {
            $query->whereDate('time_in', $request->date);
        }

        $attendances = $query->latest()->paginate($request->per_page ?? 15);

        return response()->json([
            'status' => 1,
            'data' => $attendances,
        ]);
    }

    public function show(Attendance $attendance)
    {
        $this->authorize('view', $attendance);
        $attendance->load('member');
        return response()->json([
            'status' => 1,
            'data' => $attendance,
        ]);
    }

    /**
     * QR Scan endpoint – finds member by QR code and logs attendance
     */
    public function scan(Request $request)
    {
        $request->validate([
            'qr_code' => ['required', 'string'],
        ]);

        $member = Member::where('qr_code', $request->qr_code)->first();

        if (!$member) {
            return response()->json([
                'status' => 0,
                'message' => 'Member not found.',
            ], 404);
        }

        // Check if member can clock in/out
        if (!$member->canClockIn()) {
            return response()->json([
                'status' => 0,
                'message' => 'Member cannot clock in/out. Membership or contract is not active.',
            ], 403);
        }

        // Check if there is an active attendance (no time_out)
        $active = Attendance::where('members_id', $member->id)
            ->whereNull('time_out')
            ->first();

        if ($active) {
            // Clock out: ensure the active attendance is from today
            if ($active->time_in->toDateString() !== now()->toDateString()) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Active clock-in found but not from today. Please contact admin.',
                ], 422);
            }

            $active->update(['time_out' => now()]);

            return response()->json([
                'status' => 1,
                'message' => 'Clocked out successfully.',
                'data' => $active->load('member'),
                'action' => 'clock_out',
            ]);
        }

        // No active attendance: check if already clocked in today (any attendance today)
        $today = now()->toDateString();
        $existingToday = Attendance::where('members_id', $member->id)
            ->whereDate('time_in', $today)
            ->exists();

        if ($existingToday) {
            return response()->json([
                'status' => 0,
                'message' => 'Already clocked in today.',
            ], 422);
        }

        // Clock in
        $attendance = Attendance::create([
            'members_id' => $member->id,
            'time_in' => now(),
            'time_out' => null,
        ]);

        return response()->json([
            'status' => 1,
            'message' => 'Clocked in successfully.',
            'data' => $attendance->load('member'),
            'action' => 'clock_in',
        ], 201);
    }

    public function store(AttendanceRequest $request)
    {
        $this->authorize('create', Attendance::class);

        $validated = $request->validated();
        $member = Member::find($validated['members_id']);

        if (!$member) {
            return response()->json([
                'status' => 0,
                'message' => 'Member not found.',
            ], 404);
        }

        // If time_out is provided, treat as clock‑out
        if (!empty($validated['time_out'])) {
            $active = Attendance::where('members_id', $member->id)
                ->whereNull('time_out')
                ->first();

            if (!$active) {
                return response()->json([
                    'status' => 0,
                    'message' => 'No active clock‑in found for this member.',
                ], 422);
            }

            // Ensure the active clock‑in is from today
            if ($active->time_in->toDateString() !== now()->toDateString()) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Cannot clock out: this clock‑in is not from today.',
                ], 422);
            }

            // Ensure time_out is after time_in
            $timeOut = Carbon::parse($validated['time_out']);
            if ($timeOut <= $active->time_in) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Time out must be after time in.',
                ], 422);
            }

            $active->update(['time_out' => $timeOut]);

            return response()->json([
                'status' => 1,
                'message' => 'Clocked out successfully.',
                'data' => $active->load('member'),
            ]);
        }

        // Clock‑in: check if member already has attendance today
        $today = now()->toDateString();
        $existingToday = Attendance::where('members_id', $member->id)
            ->whereDate('time_in', $today)
            ->exists();

        if ($existingToday) {
            return response()->json([
                'status' => 0,
                'message' => 'Already clocked in today.',
            ], 422);
        }

        // Check if member can clock in (active membership and contract)
        if (!$member->canClockIn()) {
            return response()->json([
                'status' => 0,
                'message' => 'Member cannot clock in. Membership or contract is not active.',
            ], 403);
        }

        // Check if they are already clocked in (should not happen, but just in case)
        $active = Attendance::where('members_id', $member->id)
            ->whereNull('time_out')
            ->exists();

        if ($active) {
            return response()->json([
                'status' => 0,
                'message' => 'Member is already clocked in.',
            ], 422);
        }

        $attendance = Attendance::create($validated);

        return response()->json([
            'status' => 1,
            'message' => 'Clocked in successfully.',
            'data' => $attendance->load('member'),
        ], 201);
    }

    public function update(AttendanceRequest $request, Attendance $attendance)
    {
        $this->authorize('update', $attendance);

        $validated = $request->validated();

        // If time_out is being set/changed, ensure it's after time_in
        if (isset($validated['time_out'])) {
            $timeIn = Carbon::parse($validated['time_in'] ?? $attendance->time_in);
            $timeOut = Carbon::parse($validated['time_out']);
            if ($timeOut <= $timeIn) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Time out must be after time in.',
                ], 422);
            }
        }

        // If time_in is being changed, ensure no conflict with today's limit
        if (isset($validated['time_in'])) {
            $newDate = Carbon::parse($validated['time_in'])->toDateString();
            $today = now()->toDateString();
            // Only enforce if changing to today and we are not updating the same record
            if ($newDate === $today) {
                $conflict = Attendance::where('members_id', $attendance->members_id)
                    ->whereDate('time_in', $today)
                    ->where('id', '!=', $attendance->id)
                    ->exists();
                if ($conflict) {
                    return response()->json([
                        'status' => 0,
                        'message' => 'Another attendance record already exists for today.',
                    ], 422);
                }
            }
        }

        $attendance->update($validated);

        return response()->json([
            'status' => 1,
            'message' => 'Attendance updated.',
            'data' => $attendance->load('member'),
        ]);
    }

    public function destroy(Attendance $attendance)
    {
        $this->authorize('delete', $attendance);
        $attendance->delete();

        return response()->json([
            'status' => 1,
            'message' => 'Attendance record deleted.',
        ]);
    }
}