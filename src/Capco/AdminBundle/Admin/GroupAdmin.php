<?php

namespace Capco\AdminBundle\Admin;

use Capco\AppBundle\Entity\Group;
use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Datagrid\ListMapper;

class GroupAdmin extends Admin
{
//    public function getFormBuilder()
//    {
    ////        $this->formOptions['data_class'] = $this->getClass();
    ////
//        $options = $this->formOptions;
//        $options['validation_groups'] = 'Default';
//        $options['translation_domain'] = 'SonataUserBundle';
    ////
//        $formBuilder = $this->getFormContractor()->getFormBuilder($this->getUniqid(), $options);
    ////
//        $this->defineFormBuilder($formBuilder);
    //
//        return $formBuilder;
//    }

    /**
     * {@inheritdoc}
     */
    protected function configureListFields(ListMapper $listMapper)
    {
        $listMapper
            ->add('title', null, [
                'label' => 'admin.fields.group.title',
            ])
        ;
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
