<x-mail::message>
# {{ $notification->title }}

Hello {{ $user->name }},

{{ $notification->message }}

@if($notification->type)
**Notification type:** {{ ucfirst($notification->type) }}
@endif

@if($notification->created_at)
**Date:** {{ $notification->created_at->format('d M Y, h:i A') }}
@endif

<x-mail::button :url="config('app.url')">
Open {{ config('app.name') }}
</x-mail::button>

Thank you for using {{ config('app.name') }}.

Regards,<br>
{{ config('app.name') }}
</x-mail::message>