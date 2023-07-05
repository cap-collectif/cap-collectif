<?php

namespace Capco\AppBundle\Controller\Site;

use Capco\AppBundle\CapcoAppBundleMessagesTypes;
use Capco\AppBundle\Entity\Argument;
use Capco\AppBundle\Entity\Debate\DebateArgument;
use Capco\AppBundle\Entity\Interfaces\Trashable;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\OpinionVersion;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Resolver\UrlResolver;
use Psr\Log\LoggerInterface;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController as Controller;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Translation\TranslatorInterface;

class ModerationController extends Controller
{
    private LoggerInterface $logger;
    private TranslatorInterface $translator;
    private Publisher $publisher;

    public function __construct(
        LoggerInterface $logger,
        TranslatorInterface $translator,
        Publisher $publisher
    ) {
        $this->logger = $logger;
        $this->translator = $translator;
        $this->publisher = $publisher;
    }

    /**
     * @Route("/moderate/{token}/reason/{reason}", name="moderate_contribution", options={"i18n" = false})
     */
    public function moderateAction(string $token, string $reason)
    {
        $contribution = $this->get(GlobalIdResolver::class)->resolveByModerationToken($token);

        $hiddenReasons = [
            'reporting.status.sexual',
            'reporting.status.offending',
            'infringement-of-rights',
            'reporting.status.spam',
        ];

        $visibleReasons = ['reporting.status.off_topic', 'moderation-guideline-violation'];

        if (
            !\in_array($reason, $visibleReasons, true)
            && !\in_array($reason, $hiddenReasons, true)
        ) {
            $this->logger->warn('Unknown trash reason: ' . $reason);

            throw new NotFoundHttpException('This trash reason is not available.');
        }

        $trashedReason = $this->translator->trans($reason);

        $contribution
            ->setTrashedStatus(Trashable::STATUS_VISIBLE)
            ->setTrashedReason($trashedReason)
        ;
        $redirectUrl = $this->get(UrlResolver::class)->getObjectUrl($contribution, true);

        if (\in_array($reason, $hiddenReasons, true)) {
            $contribution->setTrashedStatus(Trashable::STATUS_INVISIBLE);
            $redirectUrl = $this->get('router')->generate('app_project_show_trashed', [
                'projectSlug' => $contribution->getProject()->getSlug(),
            ]);
        }

        $this->get('doctrine.orm.default_entity_manager')->flush();

        if ($contribution instanceof Opinion) {
            $this->publisher->publish(
                CapcoAppBundleMessagesTypes::OPINION_TRASH,
                new Message(json_encode(['opinionId' => $contribution->getId()]))
            );
        }

        if ($contribution instanceof Argument) {
            $this->publisher->publish(
                CapcoAppBundleMessagesTypes::ARGUMENT_TRASH,
                new Message(json_encode(['argumentId' => $contribution->getId()]))
            );
        }

        // We create a session for flashBag
        $flashBag = $this->get('session')->getFlashBag();
        $flashBag->add('success', $this->getTrashMessage($contribution));

        return $this->redirect($redirectUrl);
    }

    private function getTrashMessage($contribution): string
    {
        $trashMessageKey = '';
        if ($contribution instanceof Opinion || $contribution instanceof OpinionVersion) {
            $trashMessageKey = 'the-proposal-has-been-successfully-moved-to-the-trash';
        } elseif ($contribution instanceof Argument || $contribution instanceof DebateArgument) {
            $trashMessageKey = 'the-argument-has-been-successfully-moved-to-the-trash';
        }

        return $this->translator->trans($trashMessageKey);
    }
}
