<?php

namespace Capco\AdminBundle\Controller;

use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Sonata\AdminBundle\Controller\CRUDController as Controller;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;

class HighlightedContentController extends PositionableController
{
    public function __construct()
    {
        parent::__construct('capco.highlighted.resolver');
    }
}
