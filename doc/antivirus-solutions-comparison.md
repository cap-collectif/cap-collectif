# Antivirus Upload Scanning - Solutions Comparison

## Current Situation

**Problem**: Files uploaded by users are scanned only once per day (6am cron). This creates a 24-hour exposure window where infected files can be downloaded by other users.

**Current Implementation**:
- `clamscan` CLI tool runs via cron (`infrastructure/services/remote/cron/antivirus`)
- Scans only files modified since last scan
- Slack notification on virus detection
- No blocking of infected files - just notification

**Risk Level**: HIGH - Malware can propagate to users for up to 24 hours

---

## Solution Comparison

### Solution 1: Synchronous ClamAV Scan on Upload

**Description**: Scan each file immediately during the upload request using ClamAV before saving it.

**Implementation**:
- Add virus scanning in `MediaManager::validateUploadedFile()` and `TusUploadController`
- Use `clamd` daemon (socket) instead of `clamscan` CLI for performance
- Reject upload if virus detected

**Estimated Time**: 2-3 days

**Changes Required**:
1. Configure `clamd` daemon to run permanently (supervisor config)
2. Install PHP library (`appwrite/php-clamav` or socket connection)
3. Modify `MediaManager::validateUploadedFile()` to call clamd
4. Modify `TusUploadController::server()` to scan before persisting
5. Add appropriate error handling and user-facing messages
6. Update Dockerfile if needed

**Performance Impact**:
| File Size | clamscan (CLI) | clamd (daemon) |
|-----------|----------------|----------------|
| 1 MB      | ~500-800ms     | ~20-50ms       |
| 10 MB     | ~2-4s          | ~100-200ms     |
| 50 MB     | ~10-20s        | ~500ms-1s      |

> **Important**: Using `clamd` daemon is critical. The `clamscan` CLI loads virus definitions on every call (~15-20s startup), making it unusable for sync scanning. `clamd` keeps definitions in memory.

**Pros**:
- Immediate protection - no exposure window
- Simple user experience (upload fails = file rejected)
- No complex state management

**Cons**:
- Adds latency to uploads (50ms-1s with clamd)
- Clamd daemon uses ~1GB RAM permanently
- Single point of failure if clamd crashes

**Security Rating**: Excellent (no exposure window)

---

### Solution 2: Asynchronous Scan with Quarantine

**Description**: Accept uploads immediately into a "quarantine" zone, scan asynchronously via Symfony Messenger, then release or delete.

**Implementation**:
- Files uploaded to quarantine directory (not publicly accessible)
- Symfony Messenger job scans file
- On clean: move to public directory, update Media entity
- On infected: delete file, notify user, log incident

**Estimated Time**: 5-7 days

**Changes Required**:
1. Create quarantine directory structure outside webroot
2. New `ScanMediaMessage` + `ScanMediaHandler` (Symfony Messenger)
3. Add `scanStatus` field to Media entity (`pending`, `clean`, `infected`)
4. Modify `MediaManager` to save to quarantine first
5. Modify `TusUploadController` similarly
6. Add migration for new field
7. Modify file serving to check scan status
8. Add admin UI to view quarantine/infected files
9. Add user notification system for scan results
10. Handle edge cases (scan service down, timeouts)

**Pros**:
- No upload latency impact
- Files never publicly accessible until verified
- Can add VirusTotal API as secondary scanner
- Graceful degradation possible

**Cons**:
- Complex implementation
- Users must wait for scan before file is available
- Need to handle "pending" state in UI
- More failure modes to handle
- Requires database migration

**Security Rating**: Excellent (no exposure window)

---

### Solution 3: Increased Cron Frequency (Quick Win)

**Description**: Run existing cron job every 5-15 minutes instead of daily.

**Implementation**:
- Modify cron schedule from daily to every 5-15 minutes
- Optionally: start clamd daemon permanently for faster scans

**Estimated Time**: 0.5-1 day

**Changes Required**:
1. Update cron configuration (1 line change)
2. Optionally: add clamd to supervisor for permanent daemon
3. Optionally: modify cron script to use `clamdscan` instead of `clamscan`

**Pros**:
- Minimal code changes
- Quick to implement
- Reduces exposure from 24h to 5-15 minutes
- Low risk deployment

**Cons**:
- Still has exposure window (5-15 min)
- Users can still download infected files briefly
- Not a complete solution
- Increased server load from frequent scans

**Security Rating**: Medium (reduced but not eliminated exposure)

---

### Solution 4: Hybrid - Clamd Daemon + Sync Scan (Recommended) ✅ SELECTED

**Description**: Run clamd daemon permanently and perform synchronous scanning, with graceful degradation to cron-based scanning.

**Implementation**:
- Clamd daemon always running (supervised)
- Sync scan on upload via socket (fast: 20-200ms)
- If clamd unavailable: accept file, cron will scan within 5-15 min
- Cron frequency increased from daily to every 5-15 minutes

**Behavior**:
```
IF clamd is up:
    → Sync scan
    → If clean: accept file + touch last_scan_date.txt
    → If infected: DELETE file immediately + reject upload
ELSE (clamd down):
    → Accept file (log warning)
    → Cron (every 5-15 min) will scan it
```

**Estimated Time**: 2-3 days

**Changes Required**:
1. Add clamd to supervisor config (permanent daemon)
2. Create `AntivirusScanner` service with socket communication
3. Modify `MediaManager::validateUploadedFile()` to use scanner
4. Modify `TusUploadController` to use scanner
5. Add fallback: if clamd down, accept file + log warning (cron catches it)
6. Touch `last_scan_date.txt` after successful sync scan (avoid redundant cron re-scans)
7. Update cron frequency from daily to every 5-15 minutes
8. Update cron to delete infected files (`--remove=yes` instead of `--remove=no`)
9. Optionally: add health check for clamd in monitoring

**Future Improvement (Option B)**:
- Add `scannedAt` column to Media entity
- Track scan status in database instead of file timestamp
- Eliminates race condition risk

**Pros**:
- Fast scanning (20-200ms typical)
- Immediate protection when clamd is up
- Simple fallback (no async infrastructure needed)
- Defense in depth (sync + cron backup)
- Quick to implement

**Cons**:
- Clamd uses ~1GB RAM
- Brief exposure (5-15 min max) if clamd fails

**Security Rating**: Excellent (with cron safety net)

---

## Recommendation

### For Immediate Impact (< 1 week): Solution 4 (Hybrid)

**Rationale**:
1. **3-4 days** is achievable within your timeline
2. Eliminates 99%+ of exposure window
3. Graceful degradation prevents upload failures
4. Cron backup provides defense in depth

### Implementation Priority:

| Day | Task |
|-----|------|
| 1 | Configure clamd daemon in supervisor, test locally |
| 2 | Create `AntivirusScanner` service, integrate with `MediaManager` |
| 3 | Integrate with `TusUploadController`, add fallback logic |
| 4 | Testing, error handling, monitoring setup |

### If Time is Critical (< 1 day): Solution 3

Run cron every 5 minutes as immediate mitigation while working on Solution 4.

---

## Technical Notes

### Clamd Socket Configuration

```ini
# /etc/clamav/clamd.conf
LocalSocket /var/run/clamav/clamd.sock
LocalSocketMode 666
```

### PHP Integration Example

```php
// Using socket directly
$socket = fsockopen('unix:///var/run/clamav/clamd.sock');
fwrite($socket, "nSCAN {$filePath}\n");
$response = fgets($socket);
// Response: "/path/file: OK" or "/path/file: VirusName FOUND"
```

### Supervisor Config

```ini
[program:clamd]
command=/usr/sbin/clamd --foreground
autostart=true
autorestart=true
stderr_logfile=/var/log/clamd.err.log
stdout_logfile=/var/log/clamd.out.log
```

---

## Summary Table

| Solution | Time | Exposure Window | Complexity | RAM Impact | Recommendation |
|----------|------|-----------------|------------|------------|----------------|
| 1. Sync only | 2-3 days | None | Low | +1GB | Good |
| 2. Async quarantine | 5-7 days | None | High | Minimal | Too long |
| 3. Frequent cron | 0.5-1 day | 5-15 min | Very Low | Minimal | Quick win |
| **4. Hybrid** | **2-3 days** | **None*** | **Low-Medium** | **+1GB** | **✅ Selected** |

*None when clamd is up; 5-15 min exposure if clamd fails (cron fallback)

---

## Feature Flag Implementation

### Why a Feature Flag?

- **Gradual rollout**: Enable antivirus scanning per-instance
- **Emergency disable**: Quick toggle if clamd causes issues
- **Resource optimization**: Disable on instances that don't need it (no file uploads)
- **Testing**: Easy enable/disable for QA environments

### Feature Flag Name

```php
public const antivirus = 'antivirus';
```

### Implementation Plan

#### Step 1: Add Feature Flag Constant

**File**: `src/Capco/AppBundle/Toggle/Manager.php`

```php
// Add constant
final public const antivirus = 'antivirus';

// Add to $toggles array
public static array $toggles = [
    // ... existing toggles
    self::antivirus,
];

// Add to ADMIN_ALLOWED_FEATURES (admin can toggle)
public const ADMIN_ALLOWED_FEATURES = [
    // ... existing features
    self::antivirus,
];
```

#### Step 2: Modify AntivirusScanner

**File**: `src/Capco/AppBundle/Antivirus/AntivirusScanner.php`

```php
public function __construct(
    private readonly LoggerInterface $logger,
    private readonly Manager $toggleManager  // Add this
) {}

public function scan(string $filePath): ScanResult
{
    // Check feature flag first
    if (!$this->toggleManager->isActive(Manager::antivirus)) {
        $this->logger->info('AntivirusScanner: Feature disabled, skipping scan');
        return ScanResult::clean(); // Or create ScanResult::disabled()
    }

    // ... existing scan logic
}
```

#### Step 3: Update Service Configuration

**File**: `config/packages/services.yaml`

The `Manager` service should already be autowired. No changes needed if using constructor injection.

#### Step 4: Set Default State

**File**: `src/Capco/AppBundle/Command/ResetFeatureFlagsCommand.php`

Add to the appropriate environment defaults:

```php
// For prod - DISABLED by default (gradual rollout)
private array $prodToggles = [
    // ... existing
    // Manager::antivirus is NOT included here
];

// For dev - ENABLED by default (easier local testing)
private array $devToggles = [
    // ... existing
    Manager::antivirus,
];
```

**Rationale**:
- **Dev enabled**: Developers can test antivirus locally with clamd running
- **Prod disabled**: Safe rollout - enable per-instance after validation

#### Step 5: Enable via Command

```bash
# Enable on instance
php bin/console capco:toggle:enable antivirus

# Disable on instance
php bin/console capco:toggle:disable antivirus

# Check status
php bin/console capco:toggle:list | grep antivirus
```

### Behavior Matrix

| Feature Flag | Clamd Status | Behavior |
|--------------|--------------|----------|
| **Disabled** | Any | No scanning, file accepted immediately |
| **Enabled** | Up | Sync scan, reject if infected |
| **Enabled** | Down | Accept file, cron fallback |

### Frontend Consideration

#### Virus Detection Error Message

When a virus is detected, the Jodit editor must display an error message to the user.

**Translation Key** (Loco):

```
key: upload.virus.detected
en: A virus has been found, the file has been removed from the file system.
fr: Un virus a été détecté, le fichier a été supprimé du système de fichiers.
```

**Backend Response** (already implemented):

`MediasController.php` returns `400` with `errorCode: "VIRUS_DETECTED"` when infected.

**Frontend Integration**:

The Jodit editor upload handler must catch this error and display the translated message.

```typescript
// Example: Handle upload error in Jodit config
const handleUploadError = (response: { errorCode?: string }) => {
  if (response.errorCode === 'VIRUS_DETECTED') {
    toast.error(intl.formatMessage({ id: 'upload.virus.detected' }));
  }
};
```

### Clamd Service Activation (Hook on Toggle)

**Problem**: clamd uses ~1GB RAM. Should only run when feature flag is enabled.

**Solution**: Start/stop clamd when the feature flag is toggled via a Symfony event subscriber.

#### Step 1: Set clamd autostart=false

**File**: `infrastructure/services/remote/supervisord/clamd.conf`

```ini
[program:clamd]
autostart=false  ; Don't start automatically
autorestart=true
# ... rest of config
```

#### Step 2: Create ClamdManager Service

**File**: `src/Capco/AppBundle/Antivirus/ClamdManager.php`

```php
<?php

namespace Capco\AppBundle\Antivirus;

use Psr\Log\LoggerInterface;

class ClamdManager
{
    public function __construct(
        private readonly LoggerInterface $logger
    ) {}

    public function start(): bool
    {
        exec('supervisorctl start clamd 2>&1', $output, $exitCode);
        $this->logger->info('ClamdManager: Starting clamd', [
            'exitCode' => $exitCode,
            'output' => implode("\n", $output),
        ]);
        return 0 === $exitCode;
    }

    public function stop(): bool
    {
        exec('supervisorctl stop clamd 2>&1', $output, $exitCode);
        $this->logger->info('ClamdManager: Stopping clamd', [
            'exitCode' => $exitCode,
            'output' => implode("\n", $output),
        ]);
        return 0 === $exitCode;
    }

    public function isRunning(): bool
    {
        exec('supervisorctl status clamd 2>&1', $output, $exitCode);
        return str_contains(implode('', $output), 'RUNNING');
    }
}
```

#### Step 3: Create Event Subscriber for Toggle Changes

**File**: `src/Capco/AppBundle/EventSubscriber/AntivirusToggleSubscriber.php`

```php
<?php

namespace Capco\AppBundle\EventSubscriber;

use Capco\AppBundle\Antivirus\ClamdManager;
use Capco\AppBundle\Toggle\Manager;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

class AntivirusToggleSubscriber implements EventSubscriberInterface
{
    public function __construct(
        private readonly ClamdManager $clamdManager
    ) {}

    public static function getSubscribedEvents(): array
    {
        return [
            'toggle.activated' => 'onToggleActivated',
            'toggle.deactivated' => 'onToggleDeactivated',
        ];
    }

    public function onToggleActivated(ToggleEvent $event): void
    {
        if (Manager::antivirus === $event->getToggleName()) {
            $this->clamdManager->start();
        }
    }

    public function onToggleDeactivated(ToggleEvent $event): void
    {
        if (Manager::antivirus === $event->getToggleName()) {
            $this->clamdManager->stop();
        }
    }
}
```

#### Step 4: Dispatch Event in Toggle Manager

**File**: `src/Capco/AppBundle/Toggle/Manager.php` (modify activate/deactivate methods)

```php
public function activate(string $name): void
{
    // ... existing activation logic
    $this->eventDispatcher->dispatch(new ToggleEvent($name), 'toggle.activated');
}

public function deactivate(string $name): void
{
    // ... existing deactivation logic
    $this->eventDispatcher->dispatch(new ToggleEvent($name), 'toggle.deactivated');
}
```

#### Step 5: Startup Check (Container Boot)

When container starts, check flag and start clamd if needed:

**File**: `infrastructure/services/remote/supervisord/run` (add at end before exec)

```bash
# Check if antivirus is enabled at startup
ANTIVIRUS_ENABLED=$(php /var/www/bin/console capco:toggle:check antivirus --env=prod 2>/dev/null || echo "disabled")

if [[ "$ANTIVIRUS_ENABLED" == "enabled" ]]; then
    echo "[$(date -u)][SUPERVISORD] Antivirus enabled, will start clamd"
    # clamd will be started by supervisord include
    sed -i 's/autostart=false/autostart=true/' /etc/supervisord/clamd.conf
fi
```

### Behavior Summary

| Action | Result |
|--------|--------|
| Container starts, flag OFF | clamd not started (saves 1GB RAM) |
| Container starts, flag ON | clamd started automatically |
| Admin enables flag | clamd started via hook |
| Admin disables flag | clamd stopped via hook |

### Cron Behavior

The hourly cron job should also respect the feature flag:

**File**: `infrastructure/services/remote/cron/antivirus`

```bash
# At the start of the script, check if feature is enabled
# This requires a PHP check or Redis query

# Option A: Call a Symfony command that checks the flag
ANTIVIRUS_ENABLED=$(php /var/www/bin/console capco:toggle:check antivirus --env=prod 2>/dev/null)
if [[ "$ANTIVIRUS_ENABLED" != "enabled" ]]; then
    echo "[INFO] Antivirus feature flag is disabled, skipping scan."
    exit 0
fi
```

Or create a simple command:

**File**: `src/Capco/AppBundle/Command/FeatureToggle/CheckCommand.php`

```php
#[AsCommand(name: 'capco:toggle:check')]
class CheckCommand extends Command
{
    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $toggle = $input->getArgument('toggle');
        $output->write($this->manager->isActive($toggle) ? 'enabled' : 'disabled');
        return Command::SUCCESS;
    }
}
```

### Testing

```php
// In tests, mock the toggle manager
$toggleManager = $this->createMock(Manager::class);
$toggleManager->method('isActive')
    ->with(Manager::antivirus)
    ->willReturn(false);

$scanner = new AntivirusScanner($logger, $toggleManager);
$result = $scanner->scan('/path/to/file');

$this->assertTrue($result->isClean()); // Skipped scan = clean
```

### Rollout Plan

| Phase | Environment | Action |
|-------|-------------|--------|
| 1 | Dev | Flag **enabled** by default - test locally |
| 2 | Staging | Enable via `capco:toggle:enable antivirus` |
| 3 | Prod (pilot) | Enable on 1-2 production instances |
| 4 | Prod | Monitor for 24-48h |
| 5 | Prod (all) | Enable on all instances via deployment |
| 6 | Future | (Optional) Remove flag, make scanning mandatory |
