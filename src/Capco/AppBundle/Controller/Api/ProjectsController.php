<?php

namespace Capco\AppBundle\Controller\Api;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Steps\ProjectAbstractStep;
use Capco\AppBundle\Form\ProjectType;
use Capco\AppBundle\Notifier\ProjectNotifier;
use FOS\RestBundle\Controller\AbstractFOSRestController;
use Symfony\Component\HttpFoundation\Request;
use FOS\RestBundle\Controller\Annotations\Get;
use FOS\RestBundle\Controller\Annotations\Post;
use FOS\RestBundle\Controller\Annotations\View;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Entity;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

class ProjectsController extends AbstractFOSRestController
{
    /**
     * @Post("/projects")
     * @View(statusCode=201, serializerGroups={"ProjectAdmin"})
     */
    public function postProjectAction(Request $request)
    {
        $viewer = $this->getUser();
        if (!$viewer || !$viewer->isAdmin()) {
            throw new AccessDeniedHttpException('Not authorized.');
        }

        $project = new Project();
        $form = $this->createForm(ProjectType::class, $project);
        $form->submit($request->request->all(), false);

        if (!$form->isValid()) {
            return $form;
        }

        // We make sure the author can edit his project
        $author = $project->getFirstAuthor();
        $author->addRole('ROLE_ADMIN');

        $em = $this->getDoctrine()->getManager();
        $em->persist($project);
        $em->flush();

        $this->get(ProjectNotifier::class)->onCreate($project);

        return $project;
    }

    /**
     * @Get("/projects/{projectId}/steps")
     * @Entity("project", options={"mapping": {"projectId": "id"}})
     * @View(serializerGroups={"Steps", "Default", "Statuses"})
     */
    public function getProjectStepsAction(Project $project)
    {
        return $project->getSteps()->map(function (ProjectAbstractStep $step) {
            return $step->getStep();
        });
    }

    /**
     * @Get("/projects/{projectId}")
     * @Entity("project", options={"mapping": {"projectId": "id"}})
     * @View(serializerGroups={"Projects", "Default"})
     */
    public function getProjectAction(Project $project)
    {
        return $project;
    }
}
