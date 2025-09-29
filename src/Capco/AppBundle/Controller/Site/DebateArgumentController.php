<?php

namespace Capco\AppBundle\Controller\Site;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\Debate\DebateAnonymousArgument;
use Capco\AppBundle\GraphQL\Resolver\Debate\DebateUrlResolver;
use Capco\AppBundle\Repository\Debate\DebateAnonymousArgumentRepository;
use Doctrine\Common\Util\ClassUtils;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Session\SessionInterface;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Contracts\Translation\TranslatorInterface;

class DebateArgumentController extends AbstractController
{
    public function __construct(
        private readonly DebateUrlResolver $debateUrlResolver
    ) {
    }

    /**
     * @Route("/publishDebateArgument", name="capco_app_debate_publish_argument", options={"i18n" = false})
     */
    public function publishArgument(
        EntityManagerInterface $entityManager,
        DebateAnonymousArgumentRepository $repository,
        Indexer $indexer,
        LoggerInterface $logger,
        Request $request,
        SessionInterface $session,
        TranslatorInterface $translator
    ): RedirectResponse {
        $token = $request->get('token') ?? '';
        /** @var DebateAnonymousArgument $argument */
        $argument = $repository->findOneByToken($token);
        if (null === $argument) {
            $logger->info("invalid token {$token} used to publish argument");
            $this->addFlash('danger', $translator->trans('invalid-token', [], 'CapcoAppBundle'));

            return $this->redirectToRoute('app_homepage');
        }

        if ($argument->isPublished()) {
            $this->addFlash(
                'danger',
                $translator->trans('argument.published.already', [], 'CapcoAppBundle')
            );

            return $this->redirectToDebate($argument);
        }

        if (
            !$argument
                ->getDebate()
                ->getStep()
                ->isOpen()
        ) {
            $this->addFlash('danger', $translator->trans('closed', [], 'CapcoAppBundle'));

            return $this->redirectToDebate($argument);
        }

        $argument->setPublishedAt(new \DateTime());
        $entityManager->flush();
        $indexer->index(ClassUtils::getclass($argument), $argument->getId());
        $indexer->finishBulk();
        $this->addFlash(
            'success',
            $translator->trans('argument.published.confirmation', [], 'CapcoAppBundle')
        );

        //we check an attribute in session to create it, to avoid cache on queries after the redirect.
        $session->get('nothing');

        return $this->redirectToDebate($argument);
    }

    private function redirectToDebate(DebateAnonymousArgument $argument): RedirectResponse
    {
        return $this->redirect($this->debateUrlResolver->__invoke($argument->getDebate()));
    }
}
