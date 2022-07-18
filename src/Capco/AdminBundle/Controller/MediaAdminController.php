<?php

namespace Capco\AdminBundle\Controller;

use Capco\AppBundle\Manager\MediaManager;
use Capco\AppBundle\Twig\MediaExtension;
use Sonata\MediaBundle\Controller\MediaAdminController as BaseMediaAdminController;
use Symfony\Component\Form\FormRenderer;
use Symfony\Component\Form\FormView;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use Symfony\Component\HttpFoundation\Request;

class MediaAdminController extends BaseMediaAdminController
{
    /**
     * @deprecated use Media back-office instead
     */
    public function listAction(?Request $request = null)
    {
        $this->admin->checkAccess('list');

        $datagrid = $this->admin->getDatagrid();

        $formView = $datagrid->getForm()->createView();

        return $this->renderWithExtraParams('CapcoMediaBundle:MediaAdmin:list.html.twig', [
            'action' => 'list',
            'form' => $formView,
            'datagrid' => $datagrid,
            'root_category' => null,
            'csrf_token' => $this->getCsrfToken('sonata.batch'),
        ]);
    }

    /**
     * @deprecated remove this broken route after removing SonataMedia
     */
    public function browserAction()
    {
        return null;
    }

    /**
     * @deprecated use api/files instead
     */
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
                $this->get(MediaExtension::class)->path($media, 'reference'),
        ]);
    }

    private function setFormTheme(FormView $formView, $theme)
    {
        $twig = $this->get('twig');

        $twig->getRuntime(FormRenderer::class)->setTheme($formView, $theme);
    }
}
