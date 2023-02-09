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

/**
 * This extends Sonata CrudController to add breadcrumbBuild and Pool, remove in v4.
 */
class AbstractSonataCrudController extends \Sonata\AdminBundle\Controller\CRUDController
{
    protected BreadcrumbsBuilderInterface $breadcrumbsBuilder;
    protected Pool $pool;

    public function __construct(BreadcrumbsBuilderInterface $breadcrumbsBuilder, Pool $pool)
    {
        $this->breadcrumbsBuilder = $breadcrumbsBuilder;
        $this->pool = $pool;
    }

    protected function addRenderExtraParams(array $parameters = []): array
    {
        $parameters['breadcrumbs_builder'] =
            $parameters['breadcrumbs_builder'] ?? $this->breadcrumbsBuilder;

        return parent::addRenderExtraParams($parameters);
    }
}
