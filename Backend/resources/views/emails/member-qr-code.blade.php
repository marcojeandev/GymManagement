<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Gym Membership QR Code</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #ef4444;
            padding-bottom: 20px;
            margin-bottom: 20px;
        }
        .header h1 {
            color: #ef4444;
            margin: 0;
            font-size: 24px;
        }
        .header p {
            color: #6b7280;
            margin: 5px 0 0;
        }
        .logo {
            max-width: 100px;
            margin-bottom: 10px;
        }
        .qr-container {
            text-align: center;
            margin: 30px 0;
            padding: 20px;
            background-color: #f9fafb;
            border-radius: 10px;
        }
        .qr-container img {
            max-width: 300px;
            height: auto;
        }
        .qr-code-text {
            margin-top: 10px;
            color: #4b5563;
            font-size: 14px;
            word-break: break-all;
        }
        .member-details {
            background-color: #f9fafb;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .member-details h3 {
            margin-top: 0;
            color: #1f2937;
        }
        .member-details p {
            margin: 8px 0;
            color: #4b5563;
        }
        .member-details strong {
            color: #1f2937;
        }
        .badge {
            display: inline-block;
            padding: 4px 12px;
            background-color: #22c55e;
            color: white;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
        }
        .badge-expired {
            background-color: #ef4444;
        }
        .badge-pending {
            background-color: #f59e0b;
        }
        .instructions {
            color: #4b5563;
            font-size: 14px;
            line-height: 1.8;
        }
        .instructions ol {
            padding-left: 20px;
        }
        .footer {
            text-align: center;
            color: #6b7280;
            font-size: 12px;
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
            margin-top: 20px;
        }
        .footer a {
            color: #ef4444;
            text-decoration: none;
        }
        @media only screen and (max-width: 600px) {
            .container {
                padding: 20px;
            }
            .qr-container img {
                max-width: 200px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            @if(isset($gym_logo) && $gym_logo)
                <img src="{{ $gym_logo }}" alt="{{ $gym_name }}" class="logo">
            @endif
            <h1>{{ $gym_name ?? 'Gym Management' }}</h1>
            <p>Your Digital Gym Membership Card</p>
        </div>

        <!-- Greeting -->
        <p>Dear <strong>{{ $member->firstname }} {{ $member->lastname }}</strong>,</p>
        <p class="instructions">
            Welcome to <strong>{{ $gym_name ?? 'Gym Management' }}</strong>! Please find your membership QR code below.
            Present this QR code at the gym entrance for check-in.
        </p>

        <!-- QR Code -->
        <div class="qr-container">
            @if(isset($qr_code_url) && $qr_code_url)
                <img src="{{ $qr_code_url }}" alt="QR Code">
            @else
                <div style="font-size: 32px; font-family: monospace; letter-spacing: 8px; background: #f9fafb; padding: 20px; border-radius: 8px;">
                    {{ $qr_code ?? $member->qr_code }}
                </div>
            @endif
            <div class="qr-code-text">
                <strong>QR Code:</strong> {{ $member->qr_code }}
            </div>
            <p style="margin-top: 10px; font-size: 13px; color: #6b7280;">
                Scan this QR code at the gym entrance
            </p>
        </div>

        <!-- Member Details -->
        <div class="member-details">
            <h3>📋 Member Details</h3>
            <p><strong>Name:</strong> 
                {{ $member->firstname }} 
                {{ $member->middlename ? $member->middlename . ' ' : '' }}
                {{ $member->lastname }} 
                {{ $member->suffix ? $member->suffix : '' }}
            </p>
            <p><strong>Email:</strong> {{ $member->email }}</p>
            <p><strong>Contact:</strong> {{ $member->contact }}</p>
            <p><strong>Address:</strong> {{ $member->address }}</p>
            <p>
                <strong>Status:</strong> 
                <span class="badge 
                    @if($member->membership_status === 'expired') badge-expired 
                    @elseif($member->membership_status === 'pending') badge-pending 
                    @endif">
                    {{ ucfirst($member->membership_status) }}
                </span>
            </p>
        </div>

        <!-- Instructions -->
        <div class="instructions">
            <h3>📌 How to Use Your QR Code:</h3>
            <ol>
                <li><strong>Save</strong> this QR code to your phone or print it out.</li>
                <li><strong>Present</strong> it at the gym reception for check-in.</li>
                <li><strong>Scan</strong> the QR code at the entrance to log your attendance.</li>
                <li><strong>Keep</strong> it handy for every visit.</li>
            </ol>
            <p style="margin-top: 15px;">
                💡 <strong>Tip:</strong> You can also show this email on your phone at the reception.
            </p>
        </div>

        <!-- Contact -->
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #4b5563; text-align: center; font-size: 14px;">
                📞 <strong>Contact Us:</strong> {{ $gym_contact ?? 'N/A' }} &nbsp;|&nbsp; 
                ✉️ <strong>Email:</strong> <a href="mailto:{{ $gym_email ?? 'info@gym.com' }}" style="color: #ef4444;">{{ $gym_email ?? 'info@gym.com' }}</a>
            </p>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>&copy; {{ date('Y') }} {{ $gym_name ?? 'Gym Management' }}. All rights reserved.</p>
            <p style="margin-top: 5px;">
                This is an automated message. Please do not reply to this email.
            </p>
        </div>
    </div>
</body>
</html>