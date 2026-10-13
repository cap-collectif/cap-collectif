<?php

namespace CapcoTests\UnitTests\Mailer;

use Capco\AppBundle\Mailer\MailerFactory;
use PHPUnit\Framework\TestCase;

/**
 * @covers \Capco\AppBundle\Mailer\MailerFactory
 *
 * @internal
 */
class MailerFactoryTest extends TestCase
{
    public function testResolvesTypedTranslationKeysButKeepsTwigTemplates(): void
    {
        $method = new \ReflectionMethod(MailerFactory::class, 'resolveTranslationKey');
        $method->setAccessible(true);

        self::assertSame(
            'notification.comment.subject.project',
            $method->invoke(null, 'notification.comment.subject', ['objectType' => 'PROJECT'])
        );
        self::assertSame(
            '@CapcoMail/Proposal/analysisPublication.html.twig',
            $method->invoke(null, '@CapcoMail/Proposal/analysisPublication.html.twig', ['objectType' => 'PROJECT'])
        );
    }
}
