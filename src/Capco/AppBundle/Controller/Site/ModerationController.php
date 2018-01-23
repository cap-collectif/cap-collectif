<?php

namespace Capco\AppBundle\Controller\Site;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;

class ModerationController extends Controller
{
    /**
     * @Route("/moderate/{token}/reason/{reason}", name="moderate_contribution")
     */
    public function moderateAction(string $token, string $reason)
    {
        $contribution = $this->get('global_id_resolver')->resolveByModerationToken($token);

        if (!$contribution) {
            throw new NotFoundHttpException();
        }

        $hiddenReasons = [
          'reporting.status.sexual',
          'reporting.status.offending',
          'infringement-of-rights',
          'reporting.status.spam',
        ];

        $visibleReasons = [
          'reporting.status.off_topic',
          'moderation-guideline-violation',
        ];

        if (!in_array($visibleReasons, $reason, true) && !in_array($hiddenReasons, $reason, true)) {
            throw new NotFoundHttpException('This trash reason is not available.');
        }

        $trashedReason = $this->get('translator')->trans($reason);

        $contribution
          ->setTrashed(true)
          ->setTrashedAt(new \DateTime())
          ->setTrashedReason($trashedReason)
        ;

        if (in_array($hiddenReasons, $reason, true)) {
            $contribution->setEnabled(false);
        }

        $this->get('entity_manager')->flush();

        // send emails

        $message = $this->get('translator')->trans('the-proposal-has-been-successfully-moved-to-the-trash');
        $this->get('session')->getFlashBag()->add('success', $message);

        return $this->redirect(
          $this->get('capco.url.resolver')->getObjectUrl($contribution)
        );
    }
}
