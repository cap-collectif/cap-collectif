<?php

namespace Capco\AppBundle\Controller\Site;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\AbstractUserToken;
use Capco\AppBundle\Entity\ActionToken;
use Capco\AppBundle\Entity\Debate\Debate;
use Capco\AppBundle\Entity\Debate\DebateAnonymousArgument;
use Capco\AppBundle\GraphQL\Resolver\Debate\DebateUrlResolver;
use Capco\AppBundle\GraphQL\Resolver\User\UserUrlResolver;
use Capco\AppBundle\Manager\TokenManager;
use Capco\AppBundle\Repository\ActionTokenRepository;
use Capco\AppBundle\Repository\Debate\DebateAnonymousArgumentRepository;
use Capco\AppBundle\Repository\Debate\DebateVoteTokenRepository;
use Capco\AppBundle\Repository\ReplyAnonymousRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Util\ClassUtils;
use Doctrine\ORM\EntityManagerInterface;
use FOS\UserBundle\Security\LoginManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

class TokenController extends AbstractController
{
    private readonly LoginManagerInterface $loginManager;
    private readonly DebateUrlResolver $debateUrlResolver;
    private readonly UserUrlResolver $userUrlResolver;
    private readonly DebateVoteTokenRepository $debateVoteTokenRepository;
    private readonly LoggerInterface $logger;
    private readonly TranslatorInterface $translator;
    private readonly TokenManager $tokenManager;

    public function __construct(
        LoginManagerInterface $loginManager,
        DebateUrlResolver $debateUrlResolver,
        UserUrlResolver $userUrlResolver,
        DebateVoteTokenRepository $debateVoteTokenRepository,
        LoggerInterface $logger,
        TranslatorInterface $translator,
        TokenManager $tokenManager
    ) {
        $this->loginManager = $loginManager;
        $this->debateUrlResolver = $debateUrlResolver;
        $this->userUrlResolver = $userUrlResolver;
        $this->debateVoteTokenRepository = $debateVoteTokenRepository;
        $this->logger = $logger;
        $this->translator = $translator;
        $this->tokenManager = $tokenManager;
    }

    /**
     * @Route("/voteByToken", name="capco_app_debate_vote_by_token", options={"i18n" = false})
     */
    public function voteByToken(Request $request): RedirectResponse
    {
        $tokenId = $request->get('token') ?? '';
        $voteToken = $this->debateVoteTokenRepository->find($tokenId);
        if (null === $voteToken) {
            $this->logger->info("invalid token {$tokenId} used to vote on debate");
            $this->addFlash(
                'danger',
                $this->translator->trans('invalid-token', [], 'CapcoAppBundle')
            );

            return $this->redirectToRoute('app_homepage');
        }

        if (self::isTokenConsumed($voteToken)) {
            $this->logger->info("already used token {$tokenId} used to vote on debate");
            $this->addFlash(
                'danger',
                $this->translator->trans('already-used-token', [], 'CapcoAppBundle')
            );

            return $this->connectAndRedirectToDebate(
                $voteToken->getDebate(),
                $voteToken->getUser()
            );
        }

        try {
            $debateVote = $this->tokenManager->consumeVoteToken(
                $voteToken,
                $request->get('value') ?? ''
            );
        } catch (\RuntimeException $exception) {
            $this->addFlash(
                'danger',
                $this->translator->trans($exception->getMessage(), [], 'CapcoAppBundle')
            );

            return $this->connectAndRedirectToDebate(
                $voteToken->getDebate(),
                $voteToken->getUser()
            );
        }

        $this->addFlash(
            'success',
            $this->translator->trans('vote.add_success', [], 'CapcoAppBundle')
        );

        return $this->connectAndRedirectToDebate($debateVote->getDebate(), $debateVote->getUser());
    }

    /**
     * @Route("/actionToken", name="capco_app_action_token", options={"i18n" = false})
     */
    public function consumeActionToken(
        Request $request,
        ActionTokenRepository $repository
    ): Response {
        $tokenId = $request->get('token') ?? '';
        $token = $repository->find($tokenId);
        if (null === $token) {
            $this->logger->info(__METHOD__ . " : invalid token {$tokenId}");
            $this->addFlash(
                'danger',
                $this->translator->trans('invalid-token', [], 'CapcoAppBundle')
            );

            return $this->redirectToRoute('app_homepage');
        }

        if (self::isTokenConsumed($token)) {
            $this->logger->info("already used token {$tokenId} used to make action");
            $this->addFlash(
                'danger',
                $this->translator->trans('already-used-token', [], 'CapcoAppBundle')
            );

            return $this->redirectToRoute('app_homepage');
        }

        try {
            $successMessage = $this->tokenManager->consumeActionToken($token);
        } catch (\RuntimeException $exception) {
            $this->addFlash(
                'danger',
                $this->translator->trans($exception->getMessage(), [], 'CapcoAppBundle')
            );

            return $this->redirectToRoute('app_homepage');
        }

        return $this->createSuccessResponse($successMessage, $token);
    }

    /**
     * @Route("/publishDebateArgument", name="capco_app_debate_publish_argument", options={"i18n" = false})
     */
    public function publishArgument(
        EntityManagerInterface $entityManager,
        DebateAnonymousArgumentRepository $repository,
        Indexer $indexer,
        Request $request
    ): RedirectResponse {
        $token = $request->get('token') ?? '';
        /** @var DebateAnonymousArgument $argument */
        $argument = $repository->findOneByToken($token);
        if (null === $argument) {
            $this->logger->info("invalid token {$token} used to publish argument");
            $this->addFlash(
                'danger',
                $this->translator->trans('invalid-token', [], 'CapcoAppBundle')
            );

            return $this->redirectToRoute('app_homepage');
        }

        if ($argument->isPublished()) {
            $this->addFlash(
                'danger',
                $this->translator->trans('argument.published.already', [], 'CapcoAppBundle')
            );

            return $this->redirectToDebate($argument->getDebate());
        }

        if (
            !$argument
                ->getDebate()
                ->getStep()
                ->isOpen()
        ) {
            $this->addFlash('danger', $this->translator->trans('error-contribution-validation', [], 'CapcoAppBundle'));

            return $this->redirectToDebate($argument->getDebate());
        }

        $argument->setPublishedAt(new \DateTime());
        $entityManager->flush();
        $indexer->index(ClassUtils::getclass($argument), $argument->getId());
        $indexer->finishBulk();
        $this->addFlash(
            'success',
            $this->translator->trans('argument.published.confirmation', [], 'CapcoAppBundle')
        );

        return $this->redirectToDebate($argument->getDebate());
    }

    /**
     * @Route("/unsubscribeAnonymous", name="capco_app_unsubscribe_anonymous", options={"i18n" = false})
     */
    public function unsubscribeAnonymous(
        EntityManagerInterface $entityManager,
        DebateAnonymousArgumentRepository $argumentRepository,
        ReplyAnonymousRepository $replyRepository,
        Request $request
    ): Response {
        $email = $request->get('email');
        $token = $request->get('token');
        $argument = $argumentRepository->findOneBy(['email' => $email, 'token' => $token]);
        if (null === $argument) {
            $reply = $replyRepository->findOneBy(['participantEmail' => $email, 'token' => $token]);
            if (null === $reply) {
                $this->logger->info(
                    __METHOD__ . ' : invalid token and email : ' . $email . ' - ' . $token . '}'
                );
                $this->addFlash(
                    'danger',
                    $this->translator->trans('invalid-token', [], 'CapcoAppBundle')
                );

                return $this->redirectToRoute('app_homepage');
            }
        }
        $arguments = $argumentRepository->findBy(['email' => $email]);
        $replies = $replyRepository->findBy(['participantEmail' => $email]);

        foreach ($arguments as $argument) {
            $argument->setConsentInternalCommunication(false);
        }
        foreach ($replies as $reply) {
            $reply->setEmailConfirmed(false);
        }

        $entityManager->flush();

        return $this->render('@CapcoApp/User/unsubscribe.html.twig', ['redirectUrl' => null]);
    }

    private function createSuccessResponse(string $successMessage, ActionToken $token): Response
    {
        if ('unsubscribe.success' === $successMessage) {
            $redirect = $this->generateUrl(
                'capco_profile_edit',
                [],
                UrlGeneratorInterface::ABSOLUTE_URL
            );
            $redirect .= '#notifications';

            return $this->connect(
                $this->render('@CapcoApp/User/unsubscribe.html.twig', ['redirectUrl' => $redirect]),
                $token->getUser()
            );
        }

        return $this->redirectToRoute('app_homepage');
    }

    private function connectAndRedirectToDebate(Debate $debate, User $user): RedirectResponse
    {
        return $this->connect($this->redirectToDebate($debate), $user);
    }

    private function connectAndRedirectToProfile(User $user): RedirectResponse
    {
        return $this->connect($this->redirectToRoute('capco_profile_edit'), $user);
    }

    private function connect(Response $response, User $user): Response
    {
        if (null === $this->getUser()) {
            $this->loginManager->loginUser('main', $user, $response);
        }

        return $response;
    }

    private function redirectToDebate(Debate $debate): RedirectResponse
    {
        return $this->redirect($this->debateUrlResolver->__invoke($debate));
    }

    private static function isTokenConsumed(AbstractUserToken $token): bool
    {
        //unsubscribe token can be reused
        if ($token instanceof ActionToken && ActionToken::UNSUBSCRIBE === $token->getAction()) {
            return false;
        }

        return null !== $token->getConsumptionDate();
    }
}
