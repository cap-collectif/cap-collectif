<?php
namespace Capco\AdminBundle\Controller;

use Capco\AppBundle\Entity\Project;
use Capco\UserBundle\Security\Exception\ProjectAccessDeniedException;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class ProjectController extends CRUDController
{
    /**
     * @Security("has_role('ROLE_ADMIN')")
     * @Route("/admin/capco/app/project/{projectId}/preview", name="capco_admin_project_preview")
     * @ParamConverter("project", options={"mapping": {"projectId": "id"}})
     */
    public function previewAction(Request $request, Project $project): Response
    {
        $projectUrlResolver = $this->container->get(
            'Capco\AppBundle\GraphQL\Resolver\Project\ProjectUrlResolver'
        );

        return new RedirectResponse($projectUrlResolver->__invoke($project));
    }
}
