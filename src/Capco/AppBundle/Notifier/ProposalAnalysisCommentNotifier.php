<?php

namespace Capco\AppBundle\Notifier;

use Capco\AppBundle\Entity\ProposalAnalysisComment;
use Capco\AppBundle\GraphQL\Resolver\Proposal\ProposalUrlResolver;
use Capco\AppBundle\Mailer\MailerService;
use Capco\AppBundle\Mailer\Message\Comment\ProposalAnalysisCommentCreateMessage;
use Capco\AppBundle\Resolver\LocaleResolver;
use Capco\AppBundle\SiteParameter\SiteParameterResolver;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Routing\RouterInterface;

class ProposalAnalysisCommentNotifier extends BaseNotifier
{
    private readonly ProposalUrlResolver $proposalUrlResolver;
    private readonly RequestStack $requestStack;

    public function __construct(
        MailerService $mailer,
        SiteParameterResolver $siteParams,
        RouterInterface $router,
        LocaleResolver $localeResolver,
        ProposalUrlResolver $proposalUrlResolver,
        RequestStack $requestStack
    ) {
        parent::__construct($mailer, $siteParams, $router, $localeResolver);
        $this->proposalUrlResolver = $proposalUrlResolver;
        $this->requestStack = $requestStack;
    }

    public function onCreate(ProposalAnalysisComment $comment, array $emailsRecipients): void
    {
        $proposal = $comment->getProposalAnalysis()->getProposal();
        $proposalUrl = $this->proposalUrlResolver->__invoke($proposal, $this->requestStack);

        $params = [
            'organizationName' => $this->siteParams->getValue('global.site.organization_name'),
            'proposalUrl' => $proposalUrl,
        ];

        foreach ($emailsRecipients as $email) {
            $this->mailer->createAndSendMessage(
                ProposalAnalysisCommentCreateMessage::class,
                $comment,
                $params,
                null,
                $email
            );
        }
    }
}
