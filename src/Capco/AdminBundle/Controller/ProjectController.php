<?php

namespace Capco\AdminBundle\Controller;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\GraphQL\Mutation\DuplicateProjectMutation;
use Overblog\GraphQLBundle\Definition\Argument;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Routing\RouterInterface;

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
        $this->get(DuplicateProjectMutation::class)->__invoke($argument, $this->getUser());

        $this->addFlash('sonata_flash_success', 'your-project-has-been-duplicated');

        return new RedirectResponse($this->admin->generateUrl('list', ['filter' => $filters]));
    }

    public function preDelete(Request $request, object $object): Response
    {
        $entityManager = $this->container->get('doctrine')->getManager();
        $indexer = $this->container->get(Indexer::class);
        $router = $this->container->get('router');

        foreach ($object->getRealSteps() as $step) {
            if ($step instanceof CollectStep || $step instanceof SelectionStep) {
                $step->setDefaultStatus(null);
            }
        }
        $entityManager->remove($object);
        $entityManager->flush();

        $indexer->remove($object::class, $object->getId());
        $indexer->finishBulk();

        $homePageUrl = $router->generate('app_homepage', [], RouterInterface::ABSOLUTE_URL);
        $redirectUrl = $homePageUrl . 'admin-next/projects';
        // If these methods return a Response, the process is interrupted and the response will be returned as is by the controller
        return new RedirectResponse($redirectUrl);
    }
}
