<?php

namespace Capco\AppBundle\Controller\Site;

use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Resolver\UrlResolver;
use Swarrot\Broker\Message;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\Argument;
use Capco\AppBundle\Entity\OpinionVersion;
use Capco\AppBundle\CapcoAppBundleMessagesTypes;
use Capco\AppBundle\Entity\Interfaces\Trashable;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class ModerationController extends Controller
{
    /**
     * @Route("/moderate/{token}/reason/{reason}", name="moderate_contribution")
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
            !\in_array($reason, $visibleReasons, true) &&
            !\in_array($reason, $hiddenReasons, true)
        ) {
            $this->get('logger')->warn('Unknown trash reason: ' . $reason);

            throw new NotFoundHttpException('This trash reason is not available.');
        }

        $trashedReason = $this->get('translator')->trans($reason);

        $contribution
            ->setTrashedStatus(Trashable::STATUS_VISIBLE)
            ->setTrashedReason($trashedReason);
        $redirectUrl = $this->get(UrlResolver::class)->getObjectUrl($contribution);

        if (\in_array($reason, $hiddenReasons, true)) {
            $contribution->setTrashedStatus(Trashable::STATUS_INVISIBLE);
            $redirectUrl = $this->get('router')->generate('app_project_show_trashed', [
                'projectSlug' => $contribution->getProject()->getSlug(),
            ]);
        }

        $this->get('doctrine.orm.default_entity_manager')->flush();

        $trashedMessage = '';
        if ($contribution instanceof Opinion) {
            $this->get('swarrot.publisher')->publish(
                CapcoAppBundleMessagesTypes::OPINION_TRASH,
                new Message(json_encode(['opinionId' => $contribution->getId()]))
            );
            $trashedMessage = $this->get('translator')->trans(
                'the-proposal-has-been-successfully-moved-to-the-trash'
            );
        }

        if ($contribution instanceof Argument) {
            $this->get('swarrot.publisher')->publish(
                CapcoAppBundleMessagesTypes::ARGUMENT_TRASH,
                new Message(json_encode(['argumentId' => $contribution->getId()]))
            );
            $trashedMessage = $this->get('translator')->trans(
                'the-argument-has-been-successfully-moved-to-the-trash'
            );
        }

        if ($contribution instanceof OpinionVersion) {
            $trashedMessage = $this->get('translator')->trans(
                'the-proposal-has-been-successfully-moved-to-the-trash'
            );
        }

        // We create a session for flashBag
        $flashBag = $this->get('session')->getFlashBag();
        $flashBag->add('success', $trashedMessage);

        return $this->redirect($redirectUrl);
    }
}
