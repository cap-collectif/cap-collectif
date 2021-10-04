<?php

namespace Capco\AdminBundle\Controller;

use Capco\AppBundle\Security\PostVoter;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Sonata\AdminBundle\Controller\CRUDController as Controller;
use Symfony\Component\HttpFoundation\Request;

class PostController extends Controller
{
    public function createAction(Request $request = null)
    {
        $proposalId = $request->query->get('proposalId', null);
        return $this->renderWithExtraParams(
            $this->admin->getTemplate('create'),
            [
                'action' => 'create',
                'object' => $this->admin->getNewInstance(),
                'proposalId' => $proposalId
            ],
            null,
            $request
        );
    }

    public function editAction($id = null)
    {
        $post = $this->admin->getObject($id);
        $this->denyAccessUnlessGranted(PostVoter::EDIT, $post);
        return $this->renderWithExtraParams(
            $this->admin->getTemplate('edit'),
            [
                'action' => 'edit',
                'object' => $post,
                'postId' => GlobalId::toGlobalId('Post', $id)
            ],
            null
        );
    }
}
