<?php

namespace App\Console\Commands;

use App\Models\GymSetting;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class SetGymLogo extends Command
{
    protected $signature = 'gym:set-logo {--path= : Path to the logo image file}';
    protected $description = 'Set the gym logo from a local image file or use a default placeholder.';

    public function handle()
    {
        $settings = GymSetting::first();

        if (!$settings) {
            $this->error('System settings not found. Please run migrations and setup first.');
            return 1;
        }

        $path = $this->option('path');

        if ($path && file_exists($path)) {
            $storedPath = $this->storeLogo($path);
        } else {
            $this->warn('No valid image path provided. Using a default placeholder logo.');
            $storedPath = $this->createDefaultLogo();
        }

        if (!$storedPath) {
            $this->error('Failed to set logo.');
            return 1;
        }

        $settings->update(['logo' => $storedPath]);

        $this->info('Gym logo updated successfully!');
        $this->info('Logo URL: ' . Storage::disk('public')->url($storedPath));

        return 0;
    }

    private function storeLogo(string $path): ?string
    {
        $extension = pathinfo($path, PATHINFO_EXTENSION);
        $filename = 'gym-logo.' . $extension;
        $storedPath = Storage::disk('public')->putFileAs('logos', new \Illuminate\Http\File($path), $filename);

        return $storedPath;
    }

    private function createDefaultLogo(): string
    {
        $svg = '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
            <rect width="200" height="200" fill="#ef4444" rx="20"/>
            <text x="100" y="120" font-family="Arial, sans-serif" font-size="60" fill="white" text-anchor="middle" font-weight="bold">GYM</text>
        </svg>';

        $filename = 'logos/gym-logo-default.svg';
        Storage::disk('public')->put($filename, $svg);

        return $filename;
    }
}