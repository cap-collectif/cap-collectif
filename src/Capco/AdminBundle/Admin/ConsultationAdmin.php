<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Show\ShowMapper;

use Capco\AppBundle\Entity\Step;

class ConsultationAdmin extends Admin
{
    /**
     * @param DatagridMapper $datagridMapper
     */
    protected function configureDatagridFilters(DatagridMapper $datagridMapper)
    {
        $datagridMapper
            ->add('createdAt')
            ->add('opinionCount')
            ->add('Steps')
        ;
    }

    /**
     * @param ListMapper $listMapper
     */
    protected function configureListFields(ListMapper $listMapper)
    {
        $listMapper
            ->addIdentifier('title')
            ->add('createdAt')
            ->add('opinionCount')
            ->add('Steps')
            ->add('openedAt', null, array(
                'mapped' => false,
                'template' => 'CapcoAdminBundle:Consultation:openedAt_list_field.html.twig'))
            ->add('closedAt', null, array(
                'mapped' => false,
                'template' => 'CapcoAdminBundle:Consultation:closedAt_list_field.html.twig'))
            ->add('isEnabled', null, array('editable' => true))
            ->add('_action', 'actions', array(
                'actions' => array(
                    'show' => array(),
                    'edit' => array(),
                    'delete' => array(),
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
            ->add('isEnabled')
            ->add('teaser', null, array(
                'attr' => array('class' => 'ckeditor')
            ))
            ->add('body', null, array(
                'attr' => array('class' => 'ckeditor')
            ))
            ->add('openedAt', 'sonata_type_date_picker', array(
                'required' => true,
                'mapped' => false,
                'datepicker_use_button' => false,
                'data' => $subject->getOpenedAt(),
            ))
             ->add('closedAt', 'sonata_type_date_picker', array(
                'required' => true,
                'mapped' => false,
                 'datepicker_use_button' => false,
                'data' => $subject->getClosedAt(),
                 'help' => 'admin.help.consultation.closedAt',
             ))
            ->add('Steps', null, array(
                'required' => false,
                'by_reference' => false,
                'query_builder' => $this->createStepsQuery('other'),
                'help' => 'admin.help.consultation.steps',
            ))
        ;
    }

    /**
     * @param ShowMapper $showMapper
     */
    protected function configureShowFields(ShowMapper $showMapper)
    {
        $showMapper
            ->add('title')
            ->add('slug')
            ->add('teaser')
            ->add('body')
            ->add('createdAt')
            ->add('updatedAt')
            ->add('opinionCount')
        ;
    }

    private function createStepsQuery($type)
    {
        $em = $this->modelManager->getEntityManager('CapcoAppBundle:Step');
        $query = $em->createQueryBuilder()
            ->from('CapcoAppBundle:Step', 's')
            ->select('s')
            ->where('s.type = :type')
            ->setParameter('type', Step::$stepTypes[$type]);
        return $query;
    }

    public function prePersist($consultation)
    {
        $this->setConsultationStep($consultation);
    }

    public function preUpdate($consultation)
    {
        $this->setConsultationStep($consultation);
    }

    private function setConsultationStep($consultation) {

        $consultationStep = $consultation->getConsultationStep();
        if($consultationStep == null){
            $consultationStep = new Step();
            $consultationStep->setType(Step::$stepTypes['consultation']);
            $consultationStep->setTitle('Consultation');
            $consultationStep->setPosition(1);
            $consultationStep->setConsultation($consultation);
        }

        $openingDate = $this->getForm()->get('openedAt')->getData();
        $closingDate = $this->getForm()->get('closedAt')->getData();

        $consultationStep->setStartAt($openingDate);
        $consultationStep->setEndAt($closingDate);

        $consultation->addStep($consultationStep);
    }
}
