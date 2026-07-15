<?php

namespace App\Http\Controllers;

use Illuminate\Http\Response;

class StorageController extends Controller
{
    public function getFile($path)
    {
        $filePath = storage_path('app/public/' . $path);
        
        if (!file_exists($filePath)) {
            abort(404, 'File not found');
        }
        
        return response()->file($filePath);
    }
}
