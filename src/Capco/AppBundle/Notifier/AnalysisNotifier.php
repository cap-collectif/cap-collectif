<?php

namespace Capco\AppBundle\Notifier;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Mailer\MailerService;
use Capco\AppBundle\Mailer\Message\Proposal\Analysis\AssignationMessage;
use Capco\AppBundle\Mailer\Message\Proposal\Analysis\AssignationMultiMessage;
use Capco\AppBundle\Mailer\Message\Proposal\Analysis\UnassignationMessage;
use Capco\AppBundle\Mailer\Message\Proposal\Analysis\UnassignationMultiMessage;
use Capco\AppBundle\Resolver\LocaleResolver;
use Capco\AppBundle\SiteParameter\SiteParameterResolver;
use Capco\UserBundle\Entity\User;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

class AnalysisNotifier extends BaseNotifier
{
    public function __construct(
        MailerService $mailer,
        SiteParameterResolver $siteParams,
        RouterInterface $router,
        LocaleResolver $localeResolver,
        private readonly TranslatorInterface $translator
    ) {
        parent::__construct($mailer, $siteParams, $router, $localeResolver);
    }

    public function onAssignation(User $analyst, array $proposals, string $roleKey): void
    {
        $this->addUrlToProposals($proposals);

        $this->mailer->createAndSendMessage(
            \count($proposals) > 1 ? AssignationMultiMessage::class : AssignationMessage::class,
            $proposals,
            [
                'baseUrl' => $this->getBaseUrl(),
                'projectName' => $proposals[0]->getProject()->getTitle(),
                'evaluationsUrl' => $this->getEvaluationsUrl($proposals[0]),
                'role' => $this->translator->trans($roleKey, [], 'CapcoAppBundle'),
            ],
            $analyst
        );
    }

    public function onRevoke(User $analyst, array $proposals): void
    {
        $this->mailer->createAndSendMessage(
            \count($proposals) > 1 ? UnassignationMultiMessage::class : UnassignationMessage::class,
            $proposals,
            [
                'baseUrl' => $this->getBaseUrl(),
                'projectName' => $proposals[0]->getProject()->getTitle(),
            ],
            $analyst
        );
    }

    private function addUrlToProposals(array &$proposals): void
    {
        foreach ($proposals as $proposal) {
            $proposal->url = $this->getProposalUrl($proposal);
        }
    }

    private function getProposalUrl(Proposal $proposal): string
    {
        if ($proposal->getStep() && $proposal->getProject()) {
            return $this->router->generate(
                'app_project_show_proposal',
                [
                    'proposalSlug' => $proposal->getSlug(),
                    'stepSlug' => $proposal->getStep()->getSlug(),
                    'projectSlug' => $proposal
                        ->getStep()
                        ->getProject()
                        ->getSlug(),
                ],
                UrlGeneratorInterface::ABSOLUTE_URL
            );
        }

        return $this->getBaseUrl();
    }

    private function getEvaluationsUrl(Proposal $proposal): string
    {
        if ($proposal->getStep() && $proposal->getProject()) {
            $url = $this->router->generate(
                'user_analysis_project',
                [
                    'projectSlug' => $proposal
                        ->getStep()
                        ->getProject()
                        ->getSlug(),
                ],
                UrlGeneratorInterface::ABSOLUTE_URL
            );
        } else {
            $url = $this->router->generate(
                'user_evaluations',
                [],
                UrlGeneratorInterface::ABSOLUTE_URL
            );
        }

        if ('' === $url) {
            $url = $this->getBaseUrl();
        }

        return $url;
    }

    private function getBaseUrl(): string
    {
        return $this->router->generate('app_homepage', [], UrlGeneratorInterface::ABSOLUTE_URL);
    }
}
