<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use App\Models\Member;

class MembersController extends Controller
{
    use AuthorizesRequests;

    public function store(){
        try {
            $this->authorize('create', Member::class);

            return response()->json([
                'status' => 1,
                'message' => 'Member created successfully.'
            ], 201);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 0,
                'message' => 'server error'
            ], 500);
        }
    }
}
