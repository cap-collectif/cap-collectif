<?php

namespace Capco\AppBundle\Mailer\Message\Event;

use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\GraphQL\Resolver\Event\EventUrlResolver;
use Capco\AppBundle\Mailer\Message\AdminMessage;
use Capco\AppBundle\Repository\EventRepository;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Repository\UserRepository;
use Symfony\Component\DependencyInjection\ContainerInterface;

class EventMessage extends AdminMessage
{
    public function getFooterTemplate(): string
    {
        return '';
    }

    public static function mockData(ContainerInterface $container, string $template)
    {
        $users = $container->get(UserRepository::class)->getAllAdmin();

        /** @var Event $event */
        $event = $container->get(EventRepository::class)->find('event1');
        /** @var User $user */
        foreach ($users as $user) {
            return [
                'eventUrl' => $container->get(EventUrlResolver::class)->__invoke($event, true),
                'username' => $user->getDisplayName(),
                'siteName' => 'Cap collectif',
                'baseUrl' => 'http://capco.dev',
                'siteUrl' => 'http://capco.dev',
                'eventTitle' => $event->getTitle(),
                'template' => $template
            ];
        }
    }

    protected static function getMyTemplateVars(
        Event $event,
        string $baseUrl,
        string $siteName,
        string $siteUrl,
        string $recipientName = null,
        ?string $eventUrl = null
    ): array {
        return [
            'eventTitle' => self::escape($event->getTitle()),
            'eventUrl' => $eventUrl,
            'baseUrl' => $baseUrl,
            'siteName' => $siteName,
            'siteUrl' => $siteUrl,
            'username' => $recipientName
        ];
    }

    protected static function getMySubjectVars(string $eventTitle): array
    {
        return [
            '{eventTitle}' => self::escape($eventTitle)
        ];
    }
}
