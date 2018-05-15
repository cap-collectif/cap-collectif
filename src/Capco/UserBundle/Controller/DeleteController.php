<?php

namespace Capco\UserBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;

class DeleteController extends Controller
{
    /**
     * @Route("/delete-user", name="capco_delete_user")
     */
    public function deleteUserAction(Request $request)
    {
        $removalType = $request->get('removalType');

        if ($removalType) {
            $flashBag = $this->get('session')->getFlashBag();
            $translator = $this->get('translator');

            if ('SOFT' === $removalType) {
                $flashBag->add('success', $translator->trans('account-and-contents-anonymized'));
            } elseif ('HARD' === $removalType) {
                $flashBag->add('success', $translator->trans('account-and-contents-deleted'));
            }
        }

        $this->get('security.token_storage')->setToken(null);

        return $this->redirectToRoute('app_homepage');
    }
}
