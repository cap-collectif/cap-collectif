<?php

namespace Capco\AdminBundle\Controller;

use Capco\AppBundle\Manager\MediaManager;
use Capco\AppBundle\Twig\MediaExtension;
use CoopTilleuls\Bundle\CKEditorSonataMediaBundle\Controller\MediaAdminController as BaseMediaAdminController;
use Symfony\Component\Form\FormRenderer;
use Symfony\Component\Form\FormView;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;

class MediaAdminController extends BaseMediaAdminController
{
    public function browserAction()
    {
        if (false === $this->admin->isGranted('LIST')) {
            throw new AccessDeniedException();
        }

        $datagrid = $this->admin->getDatagrid();
        $datagrid->setValue('context', null, $this->admin->getPersistentParameter('context'));
        $datagrid->setValue('providerName', null, $this->admin->getPersistentParameter('provider'));

        // Store formats
        $formats = [];
        foreach ($datagrid->getResults() as $media) {
            $formats[$media->getId()] = $this->get('sonata.media.pool')->getFormatNamesByContext(
                $media->getContext()
            );
        }

        $formView = $datagrid->getForm()->createView();

        // set the theme for the current Admin Form
        $this->setFormTheme($formView, $this->admin->getFilterTheme());

        return $this->renderWithExtraParams('CapcoMediaBundle:MediaAdmin:browser.html.twig', [
            'action' => 'browser',
            'form' => $formView,
            'datagrid' => $datagrid,
            'formats' => $formats,
            'media_pool' => $this->get('sonata.media.pool'),
            'base_template' => $this->admin->getTemplate('layout'),
            'persistent_parameters' => $this->admin->getPersistentParameters()
        ]);
    }

    public function uploadAction()
    {
        if (false === $this->admin->isGranted('CREATE')) {
            throw new AccessDeniedException();
        }

        $mediaManager = $this->get(MediaManager::class);

        $request = $this->getRequest();
        $provider = $request->get('provider');
        $file = $request->files->get('upload');

        if (!$request->isMethod('POST') || !$provider || null === $file) {
            throw $this->createNotFoundException();
        }

        $media = $mediaManager->createFileFromUploadedFile($file);

        return $this->renderWithExtraParams('CapcoMediaBundle:MediaAdmin:upload.html.twig', [
            'action' => 'list',
            'object' => $media,
            'name' => $media->getName(),
            'id' => $media->getId(),
            'url' =>
                $request->getUriForPath('/media') .
                $this->get(MediaExtension::class)->path($media, 'reference')
        ]);
    }

    private function setFormTheme(FormView $formView, $theme)
    {
        $twig = $this->get('twig');

        $twig->getRuntime(FormRenderer::class)->setTheme($formView, $theme);
    }
}
