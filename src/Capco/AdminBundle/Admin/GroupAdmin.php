<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Route\RouteCollection;

class GroupAdmin extends Admin
{
    /**
     * {@inheritdoc}
     */
    protected function configureListFields(ListMapper $listMapper)
    {
        unset($this->listModes['mosaic']);

        $listMapper
            ->add('titleInfo', null, [
                'label' => 'admin.fields.group.title',
                'template' => 'CapcoAdminBundle:Group:title_list_field.html.twig',
            ])
            ->add('countUserGroups', null, [
                'label' => 'admin.fields.group.number_users',
            ])
            ->add('updatedInfo', 'datetime', [
                'label' => 'admin.fields.group.updated_at',
                'template' => 'CapcoAdminBundle:common:updated_info_list_field.html.twig',
            ])
        ;
    }

    protected function configureRoutes(RouteCollection $collection)
    {
        $collection->clearExcept(['list', 'edit']);
    }

    //    public function getTemplate($name)
//    {
////        if ($name === 'delete') {
////            return 'CapcoAdminBundle:User:delete.html.twig';
////        }
//
//        return parent::getTemplate($name);
//    }
}
