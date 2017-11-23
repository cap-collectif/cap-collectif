<?php

namespace Capco\AppBundle\Controller\Api;

use Capco\AppBundle\CapcoAppBundleEvents;
use Capco\AppBundle\Entity\Post as BlogPost;
use Capco\AppBundle\Entity\PostComment as PostComment;
use Capco\AppBundle\Event\CommentChangedEvent;
use Capco\AppBundle\Form\CommentType;
use FOS\RestBundle\Controller\Annotations\Get;
use FOS\RestBundle\Controller\Annotations\Post;
use FOS\RestBundle\Controller\Annotations\QueryParam;
use FOS\RestBundle\Controller\Annotations\View;
use FOS\RestBundle\Controller\FOSRestController;
use FOS\RestBundle\Request\ParamFetcherInterface;
use Nelmio\ApiDocBundle\Annotation\ApiDoc;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

class PostsController extends FOSRestController
{
    /**
     * Get post comments.
     *
     * @ApiDoc(
     *  resource=true,
     *  description="Get post comments",
     *  statusCodes={
     *    200 = "Returned when successful",
     *    404 = "Post does not exist",
     *  }
     * )
     *
     * @Get("/posts/{id}/comments")
     * @ParamConverter("post", options={"mapping": {"id": "id"}})
     * @QueryParam(name="offset", requirements="[0-9.]+", default="0")
     * @QueryParam(name="limit", requirements="[0-9.]+", default="10")
     * @QueryParam(name="filter", requirements="(old|last|popular)", default="last")
     * @View(serializerGroups={"Comments", "UsersInfos"})
     */
    public function getPostCommentsAction(BlogPost $post, ParamFetcherInterface $paramFetcher)
    {
        $offset = $paramFetcher->get('offset');
        $limit = $paramFetcher->get('limit');
        $filter = $paramFetcher->get('filter');

        $paginator = $this->getDoctrine()->getManager()
                    ->getRepository('CapcoAppBundle:PostComment')
                    ->getEnabledByPost($post, $offset, $limit, $filter);

        $comments = [];
        foreach ($paginator as $comment) {
            $comments[] = $comment;
        }

        $countWithAnswers = $this->getDoctrine()->getManager()
                      ->getRepository('CapcoAppBundle:PostComment')
                      ->countCommentsAndAnswersEnabledByPost($post);

        return [
            'comments_and_answers_count' => (int) $countWithAnswers,
            'comments_count' => count($paginator),
            'comments' => $comments,
        ];
    }

    /**
     * Add a post comment.
     *
     * @ApiDoc(
     *  resource=true,
     *  description="Post an post comment",
     *  statusCodes={
     *    201 = "Returned when successful",
     *    404 = "Post does not exist",
     *  }
     * )
     *
     * @Post("/posts/{id}/comments")
     * @ParamConverter("post", options={"mapping": {"id": "id"}})
     * @View(statusCode=201, serializerGroups={"Comments", "UsersInfos"})
     */
    public function postPostCommentsAction(Request $request, BlogPost $post)
    {
        $user = $this->getUser();

        $comment = (new PostComment())
                    ->setAuthorIp($request->getClientIp())
                    ->setAuthor($user)
                    ->setPost($post)
                    ->setIsEnabled(true)
                ;

        $form = $this->createForm(new CommentType($user), $comment);
        $form->handleRequest($request);

        if (!$form->isValid()) {
            return $form;
        }

        $parent = $comment->getParent();
        if ($parent) {
            if (!$parent instanceof PostComment || $post !== $parent->getPost()) {
                throw $this->createNotFoundException('This parent comment is not linked to this post');
            }
            if ($parent->getParent() !== null) {
                throw new BadRequestHttpException('You can\'t answer the answer of a comment.');
            }
        }

        $post->setCommentsCount($post->getCommentsCount() + 1);
        $this->getDoctrine()->getManager()->persist($comment);
        $this->getDoctrine()->getManager()->flush();
        $this->get('redis_storage.helper')->recomputeUserCounters($user);
        $this->get('event_dispatcher')->dispatch(
            CapcoAppBundleEvents::COMMENT_CHANGED,
            new CommentChangedEvent($comment, 'add')
        );
    }
}
