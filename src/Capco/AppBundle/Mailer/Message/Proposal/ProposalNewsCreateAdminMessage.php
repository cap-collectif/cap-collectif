<?php

namespace Capco\AppBundle\Mailer\Message\Proposal;

use Capco\AppBundle\Entity\Post;
use Capco\AppBundle\GraphQL\Resolver\Post\PostUrlResolver;
use Capco\AppBundle\Mailer\Message\AbstractAdminMessage;
use Capco\AppBundle\Repository\PostRepository;
use Psr\Container\ContainerInterface;

final class ProposalNewsCreateAdminMessage extends AbstractAdminMessage
{
    public const SUBJECT = 'proposal_news.subject';
    public const TEMPLATE = '@CapcoMail/Proposal/notifyProposalNewsAdmin.html.twig';
    public const FOOTER = '';

    public static function getMyTemplateVars(Post $post, array $params): array
    {
        $proposal = $post->getProposals()->first();

        return [
            'postAuthor' => self::escape(
                $post
                    ->getAuthors()
                    ->first()
                    ->getDisplayName()
            ),
            'proposalName' => self::escape($proposal->getTitle()),
            'postURL' => $params['postURL'],
            'baseUrl' => $params['baseURL'],
            'projectName' => self::escape(
                $proposal
                    ->getProposalForm()
                    ->getStep()
                    ->getProject()
                    ->getTitle()
            ),
            'bodyTrad' => 'notification.proposal_activity.create.body',
            'titleTrad' => 'notification.proposal_activity.create.subject',
        ];
    }

    public static function getMySubjectVars(Post $post, array $params): array
    {
        return [];
    }

    public static function mockData(ContainerInterface $container)
    {
        /** @var Post $post */
        $post = $container->get(PostRepository::class)->find('post18');
        $postUrl = $container->get(PostUrlResolver::class)->__invoke($post);

        return [
            'postAuthor' => $post
                ->getAuthors()
                ->first()
                ->getDisplayname(),
            'proposalName' => $post
                ->getProposals()
                ->first()
                ->getTitle(),
            'projectName' => $post
                ->getProposals()
                ->first()
                ->getProject()
                ->getTitle(),
            'postURL' => $postUrl,
            'organizationName' => 'Cap Collectif',
            'siteName' => 'Cap Collectif',
            'baseUrl' => 'http://capco.dev',
            'siteUrl' => 'http://capco.dev',
            'user_locale' => 'fr_FR',
            'template' => self::TEMPLATE,
            'bodyTrad' => 'notification.proposal_activity.create.body',
            'titleTrad' => 'notification.proposal_activity.create.subject',
        ];
    }

    public static function getMyFooterVars(
        string $recipientEmail = '',
        string $siteName = '',
        string $siteURL = ''
    ): array {
        return [];
    }
}
