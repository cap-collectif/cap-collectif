<?php

namespace Capco\AppBundle\Controller\Site;

use Capco\AppBundle\Entity\Debate\Debate;
use Capco\AppBundle\GraphQL\Resolver\Debate\DebateUrlResolver;
use Capco\AppBundle\Manager\TokenManager;
use Capco\AppBundle\Repository\Debate\DebateVoteTokenRepository;
use Capco\UserBundle\Entity\User;
use FOS\UserBundle\Security\LoginManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Contracts\Translation\TranslatorInterface;

class DebateVoteController extends AbstractController
{
    private LoginManagerInterface $loginManager;
    private DebateUrlResolver $debateUrlResolver;
    private DebateVoteTokenRepository $debateVoteTokenRepository;

    public function __construct(
        LoginManagerInterface $loginManager,
        DebateUrlResolver $debateUrlResolver,
        DebateVoteTokenRepository $debateVoteTokenRepository
    ) {
        $this->loginManager = $loginManager;
        $this->debateUrlResolver = $debateUrlResolver;
        $this->debateVoteTokenRepository = $debateVoteTokenRepository;
    }

    /**
     * @Route("/voteByToken", name="capco_app_debate_vote_by_token", options={"i18n" = false})
     */
    public function voteByToken(
        TokenManager $tokenManager,
        LoggerInterface $logger,
        Request $request,
        TranslatorInterface $translator
    ) {
        $tokenId = $request->get('token') ?? '';
        $voteToken = $this->debateVoteTokenRepository->find($tokenId);
        if (null === $voteToken) {
            $logger->info("invalid token ${tokenId} used to vote on debate");
            $this->addFlash('danger', $translator->trans('invalid-token', [], 'CapcoAppBundle'));
            return $this->redirectToRoute('app_homepage');
        }

        if ($voteToken->getConsumptionDate()) {
            $logger->info("already used token ${tokenId} used to vote on debate");
            $this->addFlash('danger', $translator->trans('already-used-token', [], 'CapcoAppBundle'));
            return $this->connectAndRedirectToDebate($voteToken->getDebate(), $voteToken->getUser());
        }

        try {
            $debateVote = $tokenManager->consumeVoteToken($voteToken, $request->get('value') ?? '');
        } catch (\RuntimeException $exception) {
            $this->addFlash('danger', $translator->trans($exception->getMessage(), [], 'CapcoAppBundle'));
            return $this->connectAndRedirectToDebate($voteToken->getDebate(), $voteToken->getUser());
        }

        $this->addFlash('success', $translator->trans('vote.add_success', [], 'CapcoAppBundle'));
        return $this->connectAndRedirectToDebate($debateVote->getDebate(), $debateVote->getUser());
    }

    private function connectAndRedirectToDebate(Debate $debate, User $user): Response
    {
        $response = $this->redirect($this->debateUrlResolver->__invoke($debate));
        if (null === $this->getUser()) {
            $this->loginManager->loginUser('main', $user, $response);
        }

        return $response;
    }
}
