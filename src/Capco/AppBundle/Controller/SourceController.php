<?php

namespace Capco\AppBundle\Controller;

use Capco\AppBundle\Entity\Consultation;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\OpinionType;
use Capco\AppBundle\Entity\Source;
use Capco\AppBundle\Entity\SourceVote;
use Capco\AppBundle\Form\SourcesType;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Cache;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use Symfony\Component\Form\Form;

class SourceController extends Controller
{

    /**
     * @Route("/{opinion_slug}/sources/add", name="app_new_source")
     * @ParamConverter("opinion", class="CapcoAppBundle:Opinion", options={"mapping": {"opinion_slug": "slug"}})
     * @param $opinion
     * @param $request
     * @Template("CapcoAppBundle:Source:create.html.twig")
     * @return array
     */
    public function createSourceAction(Opinion $opinion, Request $request)
    {
        if (false === $this->get('security.authorization_checker')->isGranted('ROLE_USER')) {
            throw new AccessDeniedException($this->get('translator')->trans('Access restricted to authenticated users'));
        }

        if (false == $opinion->getConsultation()->getIsEnabled()) {
            throw new AccessDeniedException($this->get('translator')->trans('Access restricted'));
        }

        if (Consultation::OPENING_STATUS_OPENED != $opinion->getConsultation()->getOpeningStatus()) {
            throw new AccessDeniedException($this->get('translator')->trans('Access restricted'));
        }

        if (false == $opinion->getIsEnabled()) {
            throw new AccessDeniedException($this->get('translator')->trans('Access restricted'));
        }

        if ($opinion->getIsTrashed()) {
            throw new AccessDeniedException($this->get('translator')->trans('Access restricted'));
        }

        $source = new Source();
        $source->setAuthor($this->getUser());
        $opinion->addSource($source);

        $form = $this->createForm(new SourcesType(), $source);

        if ($request->getMethod() == 'POST') {
            $form->handleRequest($request);

            if ($form->isValid()) {
                $em = $this->getDoctrine()->getManager();
                $em->persist($source);
                $em->flush();
                $this->get('session')->getFlashBag()->add('success', $this->get('translator')->trans('Your source has been saved'));
                return $this->redirect($this->generateUrl('app_consultation_show_opinion', ['consultation_slug' => $opinion->getConsultation()->getSlug(), 'opinion_type_slug' => $opinion->getOpinionType()->getSlug(), 'opinion_slug' => $opinion->getSlug() ]) . '#source' . $source->getId());
            }
        }

        return [
            'consultation' => $opinion->getConsultation(),
            'opinionType' => $opinion->getOpinionType(),
            'opinion' => $opinion,
            'form' => $form->createView(),
            'buttonActive' => $form->get('type')->getData(),
        ];
    }

    /**
     * @Route("/{opinion_slug}/sources/delete/{source_slug}", name="app_delete_source")
     * @ParamConverter("source", class="CapcoAppBundle:Source", options={"mapping": {"source_slug": "slug"}})
     * @ParamConverter("opinion", class="CapcoAppBundle:Opinion", options={"mapping": {"opinion_slug": "slug"}})
     * @param $opinion
     * @param $source
     * @param $request
     * @Template("CapcoAppBundle:Source:delete.html.twig")
     * @return array
     */
    public function deleteSourceAction(Opinion $opinion, Source $source, Request $request)
    {
        if (false === $this->get('security.authorization_checker')->isGranted('ROLE_USER')) {
            throw new AccessDeniedException($this->get('translator')->trans('Access restricted to authenticated users'));
        }

        if (false == $opinion->getConsultation()->getIsEnabled()) {
            throw new AccessDeniedException($this->get('translator')->trans('Access restricted'));
        }

        if (Consultation::OPENING_STATUS_OPENED != $opinion->getConsultation()->getOpeningStatus()) {
            throw new AccessDeniedException($this->get('translator')->trans('Access restricted'));
        }

        if (false == $opinion->getIsEnabled()) {
            throw new AccessDeniedException($this->get('translator')->trans('Access restricted'));
        }

        if ($opinion->getIsTrashed()) {
            throw new AccessDeniedException($this->get('translator')->trans('Access restricted'));
        }

        if (false == $source->getIsEnabled()) {
            throw new AccessDeniedException($this->get('translator')->trans('Access restricted'));
        }

        if ($source->getIsTrashed()) {
            throw new AccessDeniedException($this->get('translator')->trans('Access restricted'));
        }

        $userCurrent = $this->getUser()->getId();
        $userPostSource = $source->getAuthor()->getId();

        if ($userCurrent !== $userPostSource) {
            throw new AccessDeniedException($this->get('translator')->trans('You cannot delete this source'));
        }

        //Champ CSRF
        $form = $this->createFormBuilder()->getForm();

        if ($request->getMethod() == 'POST') {
            $form->handleRequest($request);

            if ($form->isValid()) {
                $em = $this->getDoctrine()->getManager();
                $opinion->removeSource($source);
                $em->remove($source);
                $em->flush();

                $this->get('session')->getFlashBag()->add('info', $this->get('translator')->trans('The source has been deleted'));
                return $this->redirect($this->generateUrl('app_consultation_show_opinion', ['consultation_slug' => $opinion->getConsultation()->getSlug(), 'opinion_type_slug' => $opinion->getOpinionType()->getSlug(), 'opinion_slug' => $opinion->getSlug() ]));
            }
        }

        return array(
            'consultation' => $opinion->getConsultation(),
            'opinionType' => $opinion->getOpinionType(),
            'source' => $source,
            'form' => $form->createView()
        );
    }

    /**
     * @Route("/{opinion_slug}/sources/{source_slug}", name="app_edit_source")
     * @ParamConverter("source", class="CapcoAppBundle:Source", options={"mapping": {"source_slug": "slug"}})
     * @ParamConverter("opinion", class="CapcoAppBundle:Opinion", options={"mapping": {"opinion_slug": "slug"}})
     * @Template("CapcoAppBundle:Source:update.html.twig")
     * @param $request
     * @param $source
     * @param $opinion
     * @return array
     */
    public function updateSourceAction(Opinion $opinion, Source $source, Request $request)
    {
        if (false === $this->get('security.authorization_checker')->isGranted('ROLE_USER')) {
            throw new AccessDeniedException($this->get('translator')->trans('Access restricted to authenticated users'));
        }

        if (false == $opinion->getConsultation()->getIsEnabled()) {
            throw new AccessDeniedException($this->get('translator')->trans('Access restricted'));
        }

        if (Consultation::OPENING_STATUS_OPENED != $opinion->getConsultation()->getOpeningStatus()) {
            throw new AccessDeniedException($this->get('translator')->trans('Access restricted'));
        }

        if (false == $opinion->getIsEnabled()) {
            throw new AccessDeniedException($this->get('translator')->trans('Access restricted'));
        }

        if ($opinion->getIsTrashed()) {
            throw new AccessDeniedException($this->get('translator')->trans('Access restricted'));
        }

        if (false == $source->getIsEnabled()) {
            throw new AccessDeniedException($this->get('translator')->trans('Access restricted'));
        }

        if ($source->getIsTrashed()) {
            throw new AccessDeniedException($this->get('translator')->trans('Access restricted'));
        }

        $userCurrent = $this->getUser()->getId();
        $userPostSource = $source->getAuthor()->getId();

        if ($userCurrent !== $userPostSource) {
            throw new AccessDeniedException($this->get('translator')->trans('You cannot edit this source, as you are not its author'));
        }

        $form = $this->createForm(new SourcesType(), $source);
        if ($request->getMethod() == 'POST') {
            $form->handleRequest($request);

            if ($form->isValid()) {

                $type = $form->get('type')->getData();
                $em = $this->getDoctrine()->getManager();

                $linkedVotes = $em->getRepository('CapcoAppBundle:SourceVote')->findBySource($source);
                foreach($linkedVotes as $vote){
                    $em->remove($vote);
                }
                $source->resetVotes();

                if ($type === 0) {
                    $source->setMedia(null);
                    $mediaManager = $this->container->get('sonata.media.manager.media');
                    $media = $mediaManager->findOneBy(array('id' => $source->getMedia()));
                    if(null != $media) {
                        $provider = $this->get($media->getProviderName());
                        $provider->removeThumbnails($media);
                        $mediaManager->delete($media);
                    }
                }
                if ($type === 1) {
                    $source->setLink(null);
                }
                $em->persist($source);
                $em->flush();

                $this->get('session')->getFlashBag()->add('success', $this->get('translator')->trans('The source has been edited'));
                return $this->redirect($this->generateUrl('app_consultation_show_opinion', ['consultation_slug' => $opinion->getConsultation()->getSlug(), 'opinion_type_slug' => $opinion->getOpinionType()->getSlug(), 'opinion_slug' => $opinion->getSlug() ]) . '#source' . $source->getId());
            }
        }

        return [
            'consultation' => $opinion->getConsultation(),
            'opinionType' => $opinion->getOpinionType(),
            'opinion' => $opinion,
            'source' => $source,
            'form' => $form->createView(),
            'buttonActive' => $form->get('type')->getData(),
        ];
    }

    /**
     * @Route("/consultation/{consultation_slug}/{opinion_type_slug}/{opinion_slug}/source/vote/{source_id}", name="app_consultation_vote_source")
     * @ParamConverter("consultation", class="CapcoAppBundle:Consultation", options={"mapping": {"consultation_slug": "slug"}})
     * @ParamConverter("opinionType", class="CapcoAppBundle:OpinionType", options={"mapping": {"opinion_type_slug": "slug"}})
     * @ParamConverter("opinion", class="CapcoAppBundle:Opinion", options={"mapping": {"opinion_slug": "slug"}})
     * @ParamConverter("source", class="CapcoAppBundle:Source", options={"mapping": {"source_id": "id"}})
     * @param $request
     * @param $consultation
     * @param $opinionType
     * @param $opinion
     * @param $source
     * @return array
     */
    public function voteOnSourceAction(Consultation $consultation, OpinionType $opinionType, Opinion $opinion, Source $source, Request $request)
    {
        if (false === $this->get('security.authorization_checker')->isGranted('ROLE_USER')) {
            throw new AccessDeniedException($this->get('translator')->trans('Access restricted to authenticated users'));
        }

        if (false == $opinion->getConsultation()->getIsEnabled()) {
            throw new AccessDeniedException($this->get('translator')->trans('Access restricted'));
        }

        if (Consultation::OPENING_STATUS_OPENED != $opinion->getConsultation()->getOpeningStatus()) {
            throw new AccessDeniedException($this->get('translator')->trans('Access restricted'));
        }

        if (false == $opinion->getIsEnabled()) {
            throw new AccessDeniedException($this->get('translator')->trans('Access restricted'));
        }

        if ($opinion->getIsTrashed()) {
            throw new AccessDeniedException($this->get('translator')->trans('Access restricted'));
        }

        if (false == $source->getIsEnabled()) {
            throw new AccessDeniedException($this->get('translator')->trans('Access restricted'));
        }

        if ($source->getIsTrashed()) {
            throw new AccessDeniedException($this->get('translator')->trans('Access restricted'));
        }

        $user = $this->getUser();

        if ($request->getMethod() == 'POST') {

            if($this->isCsrfTokenValid('source_vote', $request->get('_csrf_token'))) {

                $em = $this->getDoctrine()->getManager();

                $sourceVote = new SourceVote();
                $sourceVote->setVoter($user);

                $userVote = $em->getRepository('CapcoAppBundle:SourceVote')->findOneBy(array(
                    'Voter' => $user,
                    'source' => $source
                ));

                if( $userVote != null ){
                    $sourceVote = $userVote;
                }

                if($userVote == null ){
                    $source->addVote($sourceVote);
                    $em->persist($source);
                    $em->persist($sourceVote);
                    $em->flush();

                    $this->get('session')->getFlashBag()->add('success', $this->get('translator')->trans('Your vote has been saved.'));
                }
                else {
                    $source->removeVote($sourceVote);
                    $em->persist($source);
                    $em->remove($sourceVote);
                    $em->flush();

                    $this->get('session')->getFlashBag()->add('info', $this->get('translator')->trans('Your vote has been removed.'));
                }
            }
            else {
                $this->get('session')->getFlashBag()->add('danger', $this->get('translator')->trans('Authentication error.'));
            }
        }

        return $this->redirect($this->generateUrl('app_consultation_show_opinion', ['consultation_slug' => $consultation->getSlug(), 'opinion_type_slug' => $opinionType->getSlug(), 'opinion_slug' => $opinion->getSlug() ]));
    }
}
