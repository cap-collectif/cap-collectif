<?php

namespace Capco\AdminBundle\Controller;

use Capco\AppBundle\Enum\UserRole;
use Capco\AppBundle\Toggle\Manager;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class UserInviteController extends \Sonata\AdminBundle\Controller\CRUDController
{
    public function listAction()
    {
        $this->denyAccessUnlessGranted(UserRole::ROLE_SUPER_ADMIN);
        if (!$this->get(Manager::class)->isActive(Manager::user_invitations)) {
            $message = sprintf(
                '%s (%s)',
                $this->get('translator')->trans('error.feature_not_enabled', [], 'CapcoAppBundle'),
                Manager::user_invitations
            );

            throw new NotFoundHttpException($message);
        }

        return $this->renderWithExtraParams('CapcoAdminBundle:UserInvite:list.html.twig');
    }
}
