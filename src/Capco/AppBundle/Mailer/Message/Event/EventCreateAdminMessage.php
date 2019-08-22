<?php

namespace Capco\AppBundle\Mailer\Message\Event;

use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\GraphQL\Resolver\Event\EventUrlResolver;
use Capco\AppBundle\Mailer\Message\AdminMessage;
use Capco\AppBundle\Repository\EventRepository;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Repository\UserRepository;
use Symfony\Component\DependencyInjection\ContainerInterface;

final class EventCreateAdminMessage extends AdminMessage
{
    public static function create(
        Event $event,
        string $eventAdminUrl,
        string $recipentEmail,
        string $baseUrl,
        string $siteName,
        string $siteUrl,
        string $recipientName = null
    ): self {
        $message = new self(
            $recipentEmail,
            $recipientName,
            'event-needing-examination',
            static::getMySubjectVars($event->getTitle()),
            '@CapcoMail/Admin/notifyAdminOfNewEvent.html.twig',
            static::getMyTemplateVars(
                $event,
                $eventAdminUrl,
                $baseUrl,
                $siteName,
                $siteUrl,
                $recipientName
            )
        );

        return $message;
    }

    public function getFooterTemplate(): string
    {
        return '';
    }

    public static function mockData(ContainerInterface $container)
    {
        $admins = $container->get(UserRepository::class)->getAllAdmin();

        /** @var Event $event */
        $event = $container->get(EventRepository::class)->find('event1');
        /** @var User $admin */
        foreach ($admins as $admin) {
            return [
                'eventAdminUrl' => $container->get(EventUrlResolver::class)->__invoke($event, true),
                'username' => $admin->getDisplayName(),
                'siteName' => 'Cap collectif',
                'baseUrl' => 'http://capco.dev',
                'siteUrl' => 'http://capco.dev',
                'eventTitle' => $event->getTitle(),
                'template' => '@CapcoMail/Admin/notifyAdminOfNewEvent.html.twig'
            ];
        }
    }

    private static function getMyTemplateVars(
        Event $event,
        string $eventAdminUrl,
        string $baseUrl,
        string $siteName,
        string $siteUrl,
        string $recipientName = null
    ): array {
        return [
            'eventTitle' => self::escape($event->getTitle()),
            'eventAdminUrl' => $eventAdminUrl,
            'baseUrl' => $baseUrl,
            'siteName' => $siteName,
            'siteUrl' => $siteUrl,
            'username' => $recipientName
        ];
    }

    private static function getMySubjectVars(string $eventTitle): array
    {
        return [
            '{eventTitle}' => self::escape($eventTitle)
        ];
    }
}
