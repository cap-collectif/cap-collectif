<?php

namespace Capco\AppBundle\Controller\Site;

use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\Source;
use Capco\AppBundle\Form\SourcesType;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;

class SourceController extends Controller
{
    /**
     * @Route("/projets/{projectSlug}/projet/{stepSlug}/opinions/{opinionTypeSlug}/{opinionSlug}/sources/{sourceSlug}/delete", name="app_delete_source")
     * @Route("/consultations/{projectSlug}/consultation/{stepSlug}/opinions/{opinionTypeSlug}/{opinionSlug}/sources/{sourceSlug}/delete", name="app_delete_source")
     *
     * @param $projectSlug
     * @param stepSlug
     * @param $opinionTypeSlug
     * @param $opinionSlug
     * @param $sourceSlug
     * @param $request
     * @Template("CapcoAppBundle:Source:delete.html.twig")
     *
     * @return array
     */
    public function deleteSourceAction($projectSlug, $stepSlug, $opinionTypeSlug, $opinionSlug, $sourceSlug, Request $request)
    {
        if (false === $this->get('security.authorization_checker')->isGranted('ROLE_USER')) {
            throw new AccessDeniedException($this->get('translator')->trans('error.access_restricted', array(), 'CapcoAppBundle'));
        }

        $source = $this->getDoctrine()->getRepository('CapcoAppBundle:Source')->getOneBySlug($sourceSlug);

        if (null == $source) {
            throw $this->createNotFoundException($this->get('translator')->trans('source.error.not_found', array(), 'CapcoAppBundle'));
        }

        if (false == $source->canContribute()) {
            throw new AccessDeniedException($this->get('translator')->trans('source.error.no_contribute', array(), 'CapcoAppBundle'));
        }

        $opinion = $source->getOpinion();
        $opinionType = $opinion->getOpinionType();
        $currentStep = $opinion->getStep();
        $project = $currentStep->getProject();

        $userCurrent = $this->getUser()->getId();
        $userPostSource = $source->getAuthor()->getId();

        if ($userCurrent !== $userPostSource) {
            throw new AccessDeniedException($this->get('translator')->trans('source.error.not_author', array(), 'CapcoAppBundle'));
        }

        //Champ CSRF
        $form = $this->createFormBuilder()->getForm();

        if ($request->getMethod() == 'POST') {
            $form->handleRequest($request);

            if ($form->isValid()) {
                $em = $this->getDoctrine()->getManager();
                $em->remove($source);
                $em->flush();

                $this->get('session')->getFlashBag()->add('info', $this->get('translator')->trans('source.delete.success'));

                return $this->redirect($this->generateUrl('app_project_show_opinion', ['projectSlug' => $project->getSlug(), 'stepSlug' => $currentStep->getSlug(), 'opinionTypeSlug' => $opinionType->getSlug(), 'opinionSlug' => $opinion->getSlug()]));
            } else {
                $this->get('session')->getFlashBag()->add('danger', $this->get('translator')->trans('source.delete.error'));
            }
        }

        return array(
            'opinion' => $opinion,
            'source' => $source,
            'form' => $form->createView(),
        );
    }

    /**
     * @Route("/projets/{projectSlug}/projet/{stepSlug}/opinions/{opinionTypeSlug}/{opinionSlug}/sources/{sourceSlug}/edit", name="app_edit_source")
     * @Route("/consultations/{projectSlug}/consultation/{stepSlug}/opinions/{opinionTypeSlug}/{opinionSlug}/sources/{sourceSlug}/edit", name="app_edit_source")
     * @Template("CapcoAppBundle:Source:update.html.twig")
     *
     * @param $projectSlug
     * @param $stepSlug
     * @param $opinionTypeSlug
     * @param $opinionSlug
     * @param $sourceSlug
     * @param $request
     *
     * @return array
     */
    public function updateSourceAction($projectSlug, $stepSlug, $opinionTypeSlug, $opinionSlug, $sourceSlug, Request $request)
    {
        if (false === $this->get('security.authorization_checker')->isGranted('ROLE_USER')) {
            throw new AccessDeniedException($this->get('translator')->trans('error.access_restricted', array(), 'CapcoAppBundle'));
        }

        $source = $this->getDoctrine()->getRepository('CapcoAppBundle:Source')->getOneBySlug($sourceSlug);

        if ($source == null) {
            throw $this->createNotFoundException($this->get('translator')->trans('source.error.not_found', array(), 'CapcoAppBundle'));
        }

        if (false == $source->canContribute()) {
            throw new AccessDeniedException($this->get('translator')->trans('source.error.no_contribute', array(), 'CapcoAppBundle'));
        }

        $opinion = $source->getLinkedOpinion();
        $opinionType = $opinion->getOpinionType();
        $currentStep = $opinion->getStep();
        $project = $currentStep->getProject();

        $userCurrent = $this->getUser()->getId();
        $userPostSource = $source->getAuthor()->getId();

        if ($userCurrent !== $userPostSource) {
            throw new AccessDeniedException($this->get('translator')->trans('source.error.not_author', array(), 'CapcoAppBundle'));
        }

        $form = $this->createForm(new SourcesType('edit'), $source);
        if ($request->getMethod() == 'POST') {
            $form->handleRequest($request);

            if ($form->isValid()) {
                $type = $form->get('type')->getData();
                $em = $this->getDoctrine()->getManager();

                $source->resetVotes();
                $source->setValidated(false);

                if ($type === 0) {
                    $source->setMedia(null);
                    $mediaManager = $this->container->get('sonata.media.manager.media');
                    $media = $mediaManager->findOneBy(array('id' => $source->getMedia()));
                    if (null != $media) {
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

                $this->get('session')->getFlashBag()->add('success', $this->get('translator')->trans('source.update.success'));

                return $this->redirect($this->generateUrl('app_project_show_opinion', ['projectSlug' => $project->getSlug(), 'stepSlug' => $currentStep->getSlug(), 'opinionTypeSlug' => $opinionType->getSlug(), 'opinionSlug' => $opinion->getSlug()]).'#source'.$source->getId());
            } else {
                $this->get('session')->getFlashBag()->add('danger', $this->get('translator')->trans('source.update.error'));
            }
        }

        return [
            'opinion' => $opinion,
            'source' => $source,
            'form' => $form->createView(),
            'buttonActive' => $form->get('type')->getData(),
        ];
    }
}
