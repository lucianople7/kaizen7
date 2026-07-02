# KAIZEN7 Forge Agent Brief

Objective: necesito transcribir audio local sin GPU
Capability: `audio.transcribe`
Provider decision: `adapt_provider`
Selected provider: `whisper`
Next action: `create_manifest_then_verify_provider`

## First Move

create_or_update_provider_manifest

## Approval Required

- install_binary
- download_model
- start_persistent_service
- use_gpu_heavy_job
- use_paid_api
- publish_external
- delete_user_assets
- change_credentials

## Evidence Required

- capability_selected
- provider_decision_recorded
- approval_gates_listed
- execution_packet_created
- verification_command_reported
- memory_writeback_draft
- transcript_exists
- timestamps_present

## Avoid

- broad_refactor
- paid_default
- gpu_default
- unapproved_install
- credential_touch
