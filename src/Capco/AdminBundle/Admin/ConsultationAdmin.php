<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Show\ShowMapper;

use Capco\AppBundle\Entity\Consultation;
use Capco\AppBundle\Entity\Step;
use Symfony\Component\Validator\Constraints\DateTime;

class ConsultationAdmin extends Admin
{

    protected $datagridValues = array(
        '_sort_order' => 'ASC',
        '_sort_by' => 'title'
    );

    /**
     * @param DatagridMapper $datagridMapper
     */
    protected function configureDatagridFilters(DatagridMapper $datagridMapper)
    {
        $datagridMapper
            ->add('title', null, array(
                'label' => 'admin.fields.consultation.title',
            ))
            ->add('Author', null, array(
                'label' => 'admin.fields.consultation.author',
            ))
            ->add('Themes', null, array(
                'label' => 'admin.fields.consultation.themes',
            ))
            ->add('Steps', null, array(
                'label' => 'admin.fields.consultation.steps',
            ))
            ->add('opinionCount', null, array(
                'label' => 'admin.fields.consultation.opinion_count',
            ))
            ->add('argumentCount', null, array(
                'label' => 'admin.fields.consultation.argument_count',
            ))
            ->add('isEnabled', null, array(
                'label' => 'admin.fields.consultation.is_enabled',
            ))
            ->add('updatedAt', null, array(
                'label' => 'admin.fields.consultation.updated_at',
            ))
        ;
    }

    /**
     * @param ListMapper $listMapper
     */
    protected function configureListFields(ListMapper $listMapper)
    {
        $listMapper
            ->addIdentifier('title', null, array(
                'label' => 'admin.fields.consultation.title',
            ))
            ->add('Author', 'sonata_type_model', array(
                'label' => 'admin.fields.consultation.author',
            ))
            ->add('Themes', 'sonata_type_collection', array(
                'label' => 'admin.fields.consultation.themes',
            ))
            ->add('openingStatus', null, array(
                'label' => 'admin.fields.consultation.opening_status',
                'mapped' => false,
                'template' => 'CapcoAdminBundle:Consultation:openingStatus_list_field.html.twig',
                'statuses' => Consultation::$openingStatuses,
            ))
            ->add('openedAt', null, array(
                'label' => 'admin.fields.consultation.opened_at',
                'mapped' => false,
                'template' => 'CapcoAdminBundle:Consultation:openedAt_list_field.html.twig'
            ))
            ->add('closedAt', null, array(
                'label' => 'admin.fields.consultation.closed_at',
                'mapped' => false,
                'template' => 'CapcoAdminBundle:Consultation:closedAt_list_field.html.twig'
            ))
            ->add('opinionCount', null, array(
                'label' => 'admin.fields.consultation.opinion_count',
            ))
            ->add('argumentCount', null, array(
                'label' => 'admin.fields.consultation.argument_count',
            ))
            ->add('isEnabled', null, array(
                'editable' => true,
                'label' => 'admin.fields.consultation.is_enabled',
            ))
            ->add('updatedAt', null, array(
                'label' => 'admin.fields.consultation.updated_at',
            ))
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
        $open = null;
        $close = null;
        if($subject != null){
            $open = $subject->getOpenedAt();
            $close = $subject->getClosedAt();
        }

        $formMapper
            ->add('title', null, array(
                'label' => 'admin.fields.consultation.title',
            ))
            ->add('isEnabled', null, array(
                'label' => 'admin.fields.consultation.is_enabled',
                'required' => false,
            ))
            ->add('Author', 'sonata_type_model', array(
                'label' => 'admin.fields.consultation.author',
            ))
            ->add('Themes', null, array(
                'label' => 'admin.fields.consultation.themes',
                'required' => false,
                'by_reference' => false,
            ))
            ->add('openedAt', 'sonata_type_datetime_picker', array(
                'required' => true,
                'mapped' => false,
                'data' => $open,
                'label' => 'admin.fields.consultation.opened_at',
                'format' => 'dd/MM/yyyy HH:mm',
                'attr' => array(
                    'data-date-format' => 'DD/MM/YYYY HH:mm'
                )
            ))
             ->add('closedAt', 'sonata_type_datetime_picker', array(
                'required' => true,
                'mapped' => false,
                'data' => $close,
                 'help' => 'admin.help.consultation.closed_at',
                 'label' => 'admin.fields.consultation.closed_at',
                 'format' => 'dd/MM/yyyy HH:mm',
                 'attr' => array(
                     'data-date-format' => 'DD/MM/YYYY HH:mm'
                 )
             ))
            ->add('Steps', null, array(
                'required' => false,
                'by_reference' => false,
                'query_builder' => $this->createStepsQuery('other'),
                'help' => 'admin.help.consultation.steps',
                'label' => 'admin.fields.consultation.steps',
            ))
            ->add('teaser', null, array(
                'attr' => array('class' => 'ckeditor'),
                'label' => 'admin.fields.consultation.teaser',
            ))
            ->add('body', null, array(
                'attr' => array('class' => 'ckeditor'),
                'label' => 'admin.fields.consultation.body',
            ))
            ->add('Cover', 'sonata_type_model_list', array(
                'required' => false,
                'label' => 'admin.fields.consultation.cover',
            ), array(
                'link_parameters' => array(
                    'context' => 'default',
                    'hide_context' => true,
                    'provider' => 'sonata.media.provider.image',
                )
            ))
            ->add('Image', 'sonata_type_model_list', array(
                'label' => 'admin.fields.consultation.image',
                'required' => false,
            ), array(
                'link_parameters' => array(
                    'context' => 'default',
                    'hide_context' => true,
                    'provider' => 'sonata.media.provider.image',
                )
            ))
            ->add('video', null, array(
                'label' => 'admin.fields.consultation.video',
                'required' => false,
                'help' => 'admin.help.consultation.video',
                ),
                array(
                    'link_parameters' => array('context' => 'consultation'),
                ))
        ;
    }

    /**
     * @param ShowMapper $showMapper
     */
    protected function configureShowFields(ShowMapper $showMapper)
    {
        $subject = $this->getSubject();

        $showMapper
            ->add('title', null, array(
                'label' => 'admin.fields.consultation.title',
            ))
            ->add('Author', null, array(
                'label' => 'admin.fields.consultation.author',
            ))
            ->add('teaser', null, array(
                'label' => 'admin.fields.consultation.teaser',
            ))
            ->add('body', null, array(
                'label' => 'admin.fields.consultation.body',
            ))
            ->add('Cover', null, array(
                'template' => 'CapcoAdminBundle:Consultation:cover_show_field.html.twig',
                'label' => 'admin.fields.consultation.cover',
            ))
            ->add('Image', null, array(
                'template' => 'CapcoAdminBundle:Consultation:cover_show_field.html.twig',
                'label' => 'admin.fields.consultation.image',
            ))
            ->add('video', null, array(
                'label' => 'admin.fields.consultation.video',
            ))
            ->add('Themes', null, array(
                'label' => 'admin.fields.consultation.themes',
            ))
            ->add('Steps', null, array(
                'label' => 'admin.fields.consultation.steps',
            ))
            ->add('openingStatus', null, array(
                'label' => 'admin.fields.consultation.opening_status',
                'mapped' => false,
                'data' => $subject->getOpeningStatus(),
                'template' => 'CapcoAdminBundle:Consultation:openingStatus_show_field.html.twig',
                'statuses' => Consultation::$openingStatuses,
            ))
            ->add('openedAt', 'datetime', array(
                'label' => 'admin.fields.consultation.opened_at',
                'mapped' => false,
                'data' => $subject->getOpenedAt(),
            ))
            ->add('closedAt', 'datetime', array(
                'label' => 'admin.fields.consultation.closed_at',
                'mapped' => false,
                'data' => $subject->getClosedAt(),
            ))
            ->add('opinionCount', null, array(
                'label' => 'admin.fields.consultation.opinion_count',
            ))
            ->add('argumentCount', null, array(
                'label' => 'admin.fields.consultation.argument_count',
            ))
            ->add('trashedOpinionCount', null, array(
                'label' => 'admin.fields.consultation.trashed_opinion_count',
            ))
            ->add('trashedArgumentCount', null, array(
                'label' => 'admin.fields.consultation.trashed_argument_count',
            ))
            ->add('isEnabled', 'boolean', array(
                'label' => 'admin.fields.consultation.is_enabled',
            ))
            ->add('createdAt', null, array(
                'label' => 'admin.fields.consultation.created_at',
            ))
            ->add('updatedAt', null, array(
                'label' => 'admin.fields.consultation.updated_at',
            ))
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
