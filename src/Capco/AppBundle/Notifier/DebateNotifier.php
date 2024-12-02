<?php

namespace Capco\AppBundle\Notifier;

use Capco\AppBundle\Entity\Debate\Debate;
use Capco\AppBundle\Entity\Debate\DebateAnonymousArgument;
use Capco\AppBundle\Entity\Debate\DebateOpinion;
use Capco\AppBundle\Entity\Debate\DebateVoteToken;
use Capco\AppBundle\Enum\ForOrAgainstType;
use Capco\AppBundle\GraphQL\Resolver\Debate\DebateUrlResolver;
use Capco\AppBundle\GraphQL\Resolver\Media\MediaUrlResolver;
use Capco\AppBundle\Mailer\MailerService;
use Capco\AppBundle\Mailer\Message\Debate\DebateArgumentConfirmationMessage;
use Capco\AppBundle\Mailer\Message\Debate\DebateLaunch;
use Capco\AppBundle\Mailer\Message\Debate\DebateReminder;
use Capco\AppBundle\Repository\DebateVoteRepository;
use Capco\AppBundle\Resolver\LocaleResolver;
use Capco\AppBundle\SiteParameter\SiteParameterResolver;
use Capco\UserBundle\Entity\User;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\RouterInterface;

class DebateNotifier extends BaseNotifier
{
    public function __construct(
        MailerService $mailer,
        SiteParameterResolver $siteParams,
        RouterInterface $router,
        LocaleResolver $localeResolver,
        private readonly DebateUrlResolver $debateUrlResolver,
        private readonly MediaUrlResolver $mediaUrlResolver,
        private readonly DebateVoteRepository $debateVoteRepository
    ) {
        parent::__construct($mailer, $siteParams, $router, $localeResolver);
    }

    public function sendDebateInvitation(DebateVoteToken $voteToken, bool $isReminder = false): void
    {
        $this->mailer->createAndSendMessage(
            $isReminder ? DebateReminder::class : DebateLaunch::class,
            $voteToken,
            [
                'organizationName' => $this->siteParams->getValue('global.site.organization_name'),
                'debateUrl' => $this->debateUrlResolver->__invoke($voteToken->getDebate()),
                'coverUrl' => $this->getCoverUrl($voteToken->getDebate()),
                'forUrl' => $this->router->generate(
                    'capco_app_debate_vote_by_token',
                    ['token' => $voteToken->getToken(), 'value' => ForOrAgainstType::FOR],
                    UrlGeneratorInterface::ABSOLUTE_URL
                ),
                'againstUrl' => $this->router->generate(
                    'capco_app_debate_vote_by_token',
                    ['token' => $voteToken->getToken(), 'value' => ForOrAgainstType::AGAINST],
                    UrlGeneratorInterface::ABSOLUTE_URL
                ),
                'forAuthorImgUrl' => $this->getOpinionAuthorImgUrl(
                    $voteToken->getDebate()->getForOpinion()
                ),
                'againstAuthorImgUrl' => $this->getOpinionAuthorImgUrl(
                    $voteToken->getDebate()->getAgainstOpinion()
                ),
                'participantsCount' => $this->getParticipantsCount($voteToken->getDebate()),
            ],
            $voteToken->getUser()
        );
    }

    public function sendArgumentConfirmation(DebateAnonymousArgument $argument): void
    {
        $this->mailer->createAndSendMessage(
            DebateArgumentConfirmationMessage::class,
            $argument,
            [
                'organizationName' => $this->siteParams->getValue('global.site.organization_name'),
                'confirmationUrl' => $this->router->generate(
                    'capco_app_debate_publish_argument',
                    ['token' => $argument->getToken()],
                    UrlGeneratorInterface::ABSOLUTE_URL
                ),
            ],
            (new User())->setEmail($argument->getEmail())
        );
    }

    private function getParticipantsCount(Debate $debate): int
    {
        return $this->debateVoteRepository->countByDebate($debate);
    }

    private function getCoverUrl(Debate $debate): ?string
    {
        if (
            $debate->getStep()
            && $debate->getStep()->getProject()
            && $debate
                ->getStep()
                ->getProject()
                ->getCover()
        ) {
            return $this->mediaUrlResolver->__invoke(
                $debate
                    ->getStep()
                    ->getProject()
                    ->getCover()
            );
        }

        return null;
    }

    private function getOpinionAuthorImgUrl(?DebateOpinion $opinion): ?string
    {
        if ($opinion && $opinion->getAuthor() && $opinion->getAuthor()->getMedia()) {
            return $this->mediaUrlResolver->__invoke($opinion->getAuthor()->getMedia());
        }

        return null;
    }
}
