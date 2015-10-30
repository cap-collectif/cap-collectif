<?php

namespace Capco\AppBundle\Controller\Api;

use Capco\AppBundle\Entity\SourceVote;
use Capco\AppBundle\Entity\Source;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\Validator\ConstraintViolationListInterface;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use FOS\RestBundle\Controller\FOSRestController;
use FOS\RestBundle\Controller\Annotations\View;
use FOS\RestBundle\Controller\Annotations\Post;
use FOS\RestBundle\Controller\Annotations\Delete;

class SourcesController extends FOSRestController
{
    /**
     * @Security("has_role('ROLE_USER')")
     * @Post("/sources/{sourceId}/votes")
     * @ParamConverter("source", options={"mapping": {"sourceId": "id"}})
     * @ParamConverter("vote", converter="fos_rest.request_body")
     * @View(statusCode=201, serializerGroups={})
     */
    public function postSourceVoteAction(Source $source, SourceVote $vote, ConstraintViolationListInterface $validationErrors)
    {
        if (!$source->canContribute()) {
            throw new BadRequestHttpException('Uncontributable source.');
        }

        $user = $this->getUser();
        $previousVote = $this->getDoctrine()->getManager()
                    ->getRepository('CapcoAppBundle:SourceVote')
                    ->findOneBy(['user' => $user, 'source' => $source]);

        if ($previousVote) {
            throw new BadRequestHttpException('Already voted.');
        }

        if ($validationErrors->count() > 0) {
            throw new BadRequestHttpException($validationErrors->__toString());
        }

        $vote
            ->setConfirmed(true)
            ->setSource($source)
            ->setUser($user)
        ;

        $source->setVoteCount($source->getVoteCount() + 1);
        $this->getDoctrine()->getManager()->persist($vote);
        $this->getDoctrine()->getManager()->flush();
    }

    /**
     * @Security("has_role('ROLE_USER')")
     * @Delete("/sources/{sourceId}/votes")
     * @ParamConverter("source", options={"mapping": {"sourceId": "id"}})
     * @View()
     */
    public function deleteSourceVoteAction(Source $source)
    {
        if (!$source->canContribute()) {
            throw new BadRequestHttpException('Uncontributable source.');
        }

        $vote = $this->getDoctrine()->getManager()
                     ->getRepository('CapcoAppBundle:SourceVote')
                     ->findOneBy(['user' => $this->getUser(), 'source' => $source]);

        if (!$vote) {
            throw new BadRequestHttpException('You have not voted for this source.');
        }

        $source->setVoteCount($source->getVoteCount() - 1);
        $this->getDoctrine()->getManager()->remove($vote);
        $this->getDoctrine()->getManager()->flush();
    }
}
