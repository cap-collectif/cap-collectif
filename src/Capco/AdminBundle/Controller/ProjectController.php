<?php

namespace Capco\AdminBundle\Controller;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\GraphQL\Mutation\DuplicateProjectMutation;
use Overblog\GraphQLBundle\Definition\Argument;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class ProjectController extends \Sonata\AdminBundle\Controller\CRUDController
{
    public function duplicateAction(Request $request): RedirectResponse
    {
        $id = $request->get($this->admin->getIdParameter());
        $filters = ['_sort_order' => 'DESC', '_sort_by' => 'createdAt'];

        /** @var Project $object */
        $object = $this->admin->getObject($id);

        if (!$object) {
            throw new NotFoundHttpException(sprintf('unable to find the object with id: %s', $id));
        }

        $argument = new Argument(['id' => $id]);
        $this->get(DuplicateProjectMutation::class)->__invoke($argument);

        $this->addFlash('sonata_flash_success', 'your-project-has-been-duplicated');

        return new RedirectResponse($this->admin->generateUrl('list', ['filter' => $filters]));
    }
}
