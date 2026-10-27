<?php

/**
 * AbstractSonataCrudController.
 *
 * Description.
 *
 * PHP Version 7
 *
 * @category Basics
 *
 * @author   Mickaël Buliard <mickael.buliard@gmail.com>
 * @license  http://www.opensource.org/licenses/mit-license.html  MIT License
 *
 * @see     None
 */

namespace Capco\AdminBundle\Controller;

use Sonata\AdminBundle\Admin\BreadcrumbsBuilderInterface;
use Sonata\AdminBundle\Admin\Pool;
use Sonata\AdminBundle\Controller\CRUDController;

/**
 * This extends Sonata CrudController to add breadcrumbBuild and Pool, remove in v4.
 */
class AbstractSonataCrudController extends CRUDController
{
    public function __construct(
        protected BreadcrumbsBuilderInterface $breadcrumbsBuilder,
        protected Pool $pool
    ) {}

    protected function addRenderExtraParams(array $parameters = []): array
    {
        $parameters['breadcrumbs_builder'] ??= $this->breadcrumbsBuilder;

        return parent::addRenderExtraParams($parameters);
    }
}
