## Parent PRD

#1

## What to build

Add phone/SMS authentication as a third login option using Supabase Auth's phone provider with Twilio as the SMS backend. Users enter their phone number, receive a 6-digit OTP, and verify to sign in or create an account. This provides login access for users without Google accounts (including users in regions where Google is restricted).

## Acceptance criteria

- [ ] Twilio account created and SMS provider configured in Supabase Auth settings
- [ ] Phone number input added to `/auth/login` alongside email and Google options
- [ ] Entering a phone number and clicking "Send Code" sends an OTP SMS via Twilio
- [ ] OTP input field shown after sending; submitting the correct code signs the user in
- [ ] On first phone sign-in, a `profiles` row is auto-created (same trigger as email/Google)
- [ ] Error states: invalid phone number format, expired OTP, wrong OTP
- [ ] Existing users can link a phone number to their account from their profile settings
- [ ] Vitest: phone signup creates profile row; wrong OTP rejected; expired OTP rejected

## Blocked by

- Blocked by #5 (auth foundation must exist)

## User stories addressed

- User stories 18, 19
