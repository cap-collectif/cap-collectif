<?php

namespace Capco\AdminBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;

class StepController extends CRUDController
{
    /**
     * Used for autocompletion of proposals in StepAdmin.
     *
     * @Security("has_role('ROLE_ADMIN')")
     * @Route("/admin/project/{projectId}/proposals_autocomplete", name="capco_admin_proposals_autocomplete")
     */
    public function retrieveProposalsAutocompleteItemsAction(Request $request, $projectId = null)
    {
        if (!$projectId) {
            return new JsonResponse([
                'status' => 'OK',
                'more' => false,
                'items' => [],
            ]);
        }

        return $this->retrieveAutocompleteItems($request, [
            'enabled' => 1,
            'isTrashed' => 2,
            'proposalForm__step__projectAbstractStep__project' => $projectId,
        ]);
    }
}
