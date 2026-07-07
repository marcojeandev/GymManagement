<?php

namespace App\Http\Controllers\Cashier;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Requests\Cashier\ContractRequest;
use App\Models\Contract;
use App\Models\Member;
use App\Models\MembershipFee;
use App\Models\ContractPrice;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class ContractController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request)
    {
        $this->authorize('viewAny', Contract::class);
        $query = Contract::with(['member', 'contractPricing']);

        if ($request->has('member_id')) {
            $query->where('members_id', $request->member_id);
        }
        if ($request->has('payment_status')) {
            $query->where('payment_status', $request->payment_status);
        }

        $contracts = $query->latest()->paginate($request->per_page ?? 15);

        return response()->json([
            'status' => 1,
            'data' => $contracts,
        ]);
    }

    public function show(Contract $contract)
    {
        $this->authorize('view', $contract);
        $contract->load(['member', 'contractPricing']);
        return response()->json([
            'status' => 1,
            'data' => $contract,
        ]);
    }

    public function store(ContractRequest $request)
    {
        $this->authorize('create', Contract::class);
        $validated = $request->validated();

        $member = Member::find($validated['members_id']);
        if (!$member) {
            return response()->json(['status' => 0, 'message' => 'Member not found.'], 404);
        }
        if ($member->contract_status === 'active') {
            return response()->json([
                'status' => 0,
                'message' => 'Member already has an active contract.'
            ], 422);
        }
        if (!MembershipFee::where('members_id', $member->id)->exists()) {
            return response()->json([
                'status' => 0,
                'message' => 'No membership fee found for this member.'
            ], 422);
        }

        $pricing = ContractPrice::find($validated['contract_id']);
        if (!$pricing) {
            return response()->json(['status' => 0, 'message' => 'Contract pricing not found.'], 404);
        }

        // Date logic: use provided or default
        $from = $request->filled('contract_from')
            ? Carbon::parse($validated['contract_from'])
            : now()->startOfDay();

        $to = $request->filled('contract_to')
            ? Carbon::parse($validated['contract_to'])
            : $from->copy()->addMonths($pricing->duration_months ?? 1);

        DB::beginTransaction();
        try {
            $contract = Contract::create(array_merge($validated, [
                'contract_from' => $from,
                'contract_to' => $to,
            ]));
            $member->update(['contract_status' => 'active']);
            DB::commit();
            return response()->json([
                'status' => 1,
                'message' => 'Contract created.',
                'data' => $contract->load(['member', 'contractPricing']),
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['status' => 0, 'message' => 'Creation failed: ' . $e->getMessage()], 500);
        }
    }

    public function update(ContractRequest $request, Contract $contract)
    {
        $this->authorize('update', $contract);
        $validated = $request->validated();

        // If changing member, validate
        if (isset($validated['members_id']) && $validated['members_id'] != $contract->members_id) {
            $newMember = Member::find($validated['members_id']);
            if (!$newMember) {
                return response()->json(['status' => 0, 'message' => 'Member not found.'], 404);
            }
            if ($newMember->contract_status === 'active') {
                return response()->json(['status' => 0, 'message' => 'Selected member already has an active contract.'], 422);
            }
            if (!MembershipFee::where('members_id', $newMember->id)->exists()) {
                return response()->json(['status' => 0, 'message' => 'Selected member has no membership fee.'], 422);
            }
        }

        // Dates logic
        $from = $validated['contract_from'] ?? $contract->contract_from;
        $to = $validated['contract_to'] ?? $contract->contract_to;

        // If contract_id changed, recompute to using duration
        if (isset($validated['contract_id']) && $validated['contract_id'] != $contract->contract_id) {
            $pricing = ContractPrice::find($validated['contract_id']);
            if (!$pricing) {
                return response()->json(['status' => 0, 'message' => 'Contract pricing not found.'], 404);
            }
            $from = $from ? Carbon::parse($from) : now()->startOfDay();
            $to = $from->copy()->addMonths($pricing->duration_months ?? 1);
            $validated['contract_from'] = $from;
            $validated['contract_to'] = $to;
        } else {
            // If dates provided, use them; else keep existing
            if (isset($validated['contract_from'])) {
                $validated['contract_from'] = Carbon::parse($validated['contract_from']);
            }
            if (isset($validated['contract_to'])) {
                $validated['contract_to'] = Carbon::parse($validated['contract_to']);
            }
        }

        DB::beginTransaction();
        try {
            $contract->update($validated);
            // Update member status based on contract_to
            $member = $contract->member;
            if ($contract->contract_to && $contract->contract_to->isFuture()) {
                $member->update(['contract_status' => 'active']);
            } else {
                $member->update(['contract_status' => 'expired']);
            }
            DB::commit();
            return response()->json([
                'status' => 1,
                'message' => 'Contract updated.',
                'data' => $contract->fresh(['member', 'contractPricing']),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['status' => 0, 'message' => 'Update failed: ' . $e->getMessage()], 500);
        }
    }

    public function destroy(Contract $contract)
    {
        $this->authorize('delete', $contract);

        DB::beginTransaction();
        try {
            // Update member's contract_status to expired
            $contract->member->update(['contract_status' => 'expired']);
            $contract->delete();
            DB::commit();

            return response()->json([
                'status' => 1,
                'message' => 'Contract deleted successfully.',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 0,
                'message' => 'Failed to delete contract: ' . $e->getMessage(),
            ], 500);
        }
    }
}