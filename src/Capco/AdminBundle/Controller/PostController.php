<?php

namespace Capco\AdminBundle\Controller;

use Capco\AppBundle\Entity\Post;
use Capco\AppBundle\Security\PostVoter;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Entity;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Contracts\Translation\TranslatorInterface;

class PostController extends AbstractController
{
    private TranslatorInterface $translator;

    public function __construct(TranslatorInterface $translator)
    {
        $this->translator = $translator;
    }

    /**
     * @Route("/admin/capco/app/post/create", name="capco_admin_create_post")
     * @Security("has_role('ROLE_USER')")
     */
    public function createAction(Request $request)
    {
        $proposalId = $request->query->get('proposalId', null);
        $post = new Post();

        return $this->render(
            'CapcoAdminBundle:Post:create.html.twig',
            [
                'action' => 'create',
                'object' => $post,
                'admin' => $post,
                'proposalId' => $proposalId,
            ],
            null
        );
    }

    /**
     * @Route("/admin/capco/app/post/{postId}/edit", name="capco_admin_edit_post")
     * @Entity("post", class="CapcoAppBundle:Post", options={"mapping" = {"postId": "id"}, "repository_method"= "find", "map_method_signature" = true})
     * @Security("has_role('ROLE_USER')")
     */
    public function editAction(?Post $post)
    {
        $this->denyAccessUnlessGranted(PostVoter::EDIT, $post);

        return $this->render(
            'CapcoAdminBundle:Post:edit.html.twig',
            [
                'action' => 'edit',
                'object' => $post,
                'title' => $this->translator->trans(
                    'global.edit.title',
                    ['name' => $post->getTitle()],
                    'SonataAdminBundle'
                ),
                'admin' => $post,
                'postId' => GlobalId::toGlobalId('Post', $post->getId()),
            ],
            null
        );
    }
}
