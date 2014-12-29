<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Show\ShowMapper;

use Capco\AppBundle\Entity\Step;

class StepAdmin extends Admin
{
    /**
     * @param DatagridMapper $datagridMapper
     */
    protected function configureDatagridFilters(DatagridMapper $datagridMapper)
    {
        $datagridMapper
            ->add('startAt')
            ->add('endAt')
            ->add('position')
            ->add('isEnabled')
            ->add('type')
            ->add('consultation')
            ->add('Page')
        ;
    }

    /**
     * @param ListMapper $listMapper
     */
    protected function configureListFields(ListMapper $listMapper)
    {
        $listMapper
            ->add('title')
            ->add('startAt')
            ->add('endAt')
            ->add('position')
            ->add('isEnabled', null, array('editable' => true))
            ->add('consultation')
            ->add('type', null, array(
                'template' => 'CapcoAdminBundle:Step:type_list_field.html.twig',
                'stepTypeLabels' => Step::$stepTypeLabels
            ))
            ->add('Page')
            ->add('_action', 'actions', array(
                'actions' => array(
                    'edit' => array(),
                    'delete' => array('template' => 'CapcoAdminBundle:Step:list__action_delete.html.twig'),
                )
            ))
        ;

    }

    /**
     * @param FormMapper $formMapper
     */
    protected function configureFormFields(FormMapper $formMapper)
    {
        $subject = $this->getSubject();
        $formMapper
            ->add('title')
            ->add('position')
        ;
        if($subject->isOtherStep()){
            $formMapper
                ->add('startAt', 'date')
                ->add('endAt', 'date', array(
                    'help' => 'admin.help.step.endAt',
                ))
                ->add('isEnabled')
                ->add('type', 'choice', array(
                    'required' => true,
                    'choices' => Step::$stepTypeLabels,
                ))
                ->add('Page')
                ->add('consultation')
            ;
        }
    }

    /**
     * @param ShowMapper $showMapper
     */
    protected function configureShowFields(ShowMapper $showMapper)
    {
        $showMapper
            ->add('title')
            ->add('slug')
            ->add('startAt')
            ->add('endAt')
            ->add('position')
            ->add('isEnabled')
            ->add('type')
            ->add('Page')
            ->add('consultation')
        ;
    }
}
