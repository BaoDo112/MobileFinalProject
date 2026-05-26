# Demo Script

This walkthrough is organized by the two active roles in the app. The quickest way to prove the new storage flow is to upload an exhibition image and profile photo as the organizer, then switch to visitor surfaces and show the same exhibition cover loading back from R2.

## Visitor Role

1. Login Entry
Sign in with local demo credentials or the fake Google flow using the Visitor workspace card. This establishes the shared identity and confirms that role selection happens at session bootstrap.

2. Gallery Home
Open the browse feed and point out that published exhibitions now show their uploaded cover image when the organizer has attached media through the studio. Use this screen to explain timeline filters and the browse-first visitor entry point.

3. Discover Map
Open the map screen and tap an exhibition marker. The bottom card should reuse the same cover image from R2, proving that the discover and gallery surfaces read from the same backend summary contract.

4. Exhibition Detail
Open one exhibition and show the hero image, venue details, session availability, highlights, and policy copy. This is the best place to explain how the visitor evaluates whether to reserve a slot.

5. Event Registration
Reserve a slot or join the waitlist. Explain that the form is generated from the organizer-authored schema and that the submission writes into the Neon-backed shared state.

6. Review Hub
Show the rating, composer state, and recent reviews. If you already checked in a visitor in the organizer flow, submit a review here to demonstrate the post-visit loop.

7. Stamp Vault
Show confirmed, upcoming, and expired stamp progress. Use this screen to explain the reward loop after attendance and review milestones.

8. Visitor Profile
Upload a profile photo. Mention that the image is now stored in R2 and the avatar URL is persisted in the backend instead of living only in local device state.

## Organizer Role

1. Switch Role
Use the profile action to switch from Visitor to Organizer without creating a second account. This is the fastest way to demonstrate that both roles live under the same identity.

2. Organizer Dashboard
Show KPI cards, urgent queue counts, and the exhibition list. Use this screen to frame the organizer workload at a glance.

3. Exhibition Studio
Open an exhibition draft, upload a media image from the device, and then save the draft. This is the main R2 demo step because the selected file is pushed through the API to Cloudflare R2 and the returned asset path is appended to `mediaUrls` automatically.

4. Form Builder
Open the form builder from the same exhibition and explain that the registration form contract is edited here and reused later by the visitor registration flow.

5. Submission Pipeline
Show the queue breakdown for pending, confirmed, waitlisted, and checked-in visitors. Use this screen to explain how the organizer triages capacity.

6. Submission Review
Approve, reject, or check in a submission. This demonstrates the live operational side of the organizer workspace and unlocks the downstream visitor stamp/review loop.

7. Organizer Profile
Upload a separate organizer avatar. This proves that profile assets for each role can be stored in R2 and restored from the backend on subsequent session loads.

## Best R2 Demo Order

1. Start as Organizer and upload an exhibition image in Exhibition Studio.
2. Save and publish the exhibition if needed.
3. Upload the organizer profile avatar.
4. Switch to Visitor.
5. Show the same exhibition cover on Gallery Home, Discover Map, and Exhibition Detail.
6. Upload the visitor avatar on Visitor Profile.
7. Sign out and sign back in if you want to prove avatar persistence across a fresh session.