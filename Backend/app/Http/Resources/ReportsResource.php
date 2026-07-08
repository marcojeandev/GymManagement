<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReportsResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'status' => 1,
            'data' => $this->resource,
            'timestamp' => now()->toISOString(),
        ];
    }

    /**
     * Create a success response with data
     */
    public static function success($data)
    {
        return new self($data);
    }

    /**
     * Create an error response
     */
    public static function error($message, $code = 0)
    {
        return response()->json([
            'status' => $code,
            'message' => $message,
            'timestamp' => now()->toISOString(),
        ], 400);
    }
}