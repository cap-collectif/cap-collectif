<?php

namespace Capco\AppBundle\Controller\Site;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class ModerationController extends Controller
{
    /**
     * @Route("/moderate/{token}/reason/{reason}", name="moderate_contribution")
     */
    public function moderateAction(string $token, string $reason)
    {
        $contribution = $this->get('global_id_resolver')->resolveByModerationToken($token);

        if (!$contribution) {
            $this->get('logger')->warn('Unknown moderation_token: ' . $token);
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

        if (!in_array($reason, $visibleReasons, true) && !in_array($reason, $hiddenReasons, true)) {
            $this->get('logger')->warn('Unknown trash reason: ' . $reason);
            throw new NotFoundHttpException('This trash reason is not available.');
        }

        $trashedReason = $this->get('translator')->trans($reason);

        $contribution
          ->setTrashed(true)
          ->setTrashedAt(new \DateTime())
          ->setTrashedReason($trashedReason)
        ;

        $redirectUrl = $this->get('capco.url.resolver')->getObjectUrl($contribution);

        if (in_array($reason, $hiddenReasons, true)) {
            $contribution->setEnabled(false);
            $redirectUrl = $this->get('router')->generate('app_project_show_trashed', [
              'projectSlug' => $contribution->getProject()->getSlug(),
            ]);
        }

        $this->get('doctrine.orm.default_entity_manager')->flush();

        // send emails

        $message = $this->get('translator')->trans('the-proposal-has-been-successfully-moved-to-the-trash');
        $this->get('session')->getFlashBag()->add('success', $message);

        return $this->redirect($redirectUrl);
    }
}
