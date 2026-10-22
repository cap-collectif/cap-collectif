<?php

namespace Capco\Tests\Mailer;

use Capco\Tests\Command\EmailCaptureListener;
use Capco\Tests\UserBundle\Functional\AccountWebTestCase;

abstract class EmailWebTestCase extends AccountWebTestCase
{
    use EmailCaptureTrait;

    protected EmailCaptureListener $emails;

    protected function configureMailer(): void
    {
        $this->emails = $this->captureEmails();
    }
}
