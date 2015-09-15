<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Form\FormMapper;
use Capco\AppBundle\Entity\OtherStep;
use Capco\AppBundle\Entity\ConsultationStep;
use Capco\AppBundle\Entity\PresentationStep;
use Capco\AppBundle\Entity\SynthesisStep;
use Sonata\AdminBundle\Route\RouteCollection;

class StepAdmin extends Admin
{
    public function getPersistentParameters()
    {
        $subject = $this->getSubject();
        $consultationId = null;

        if ($subject && $subject->getConsultation()) {
            $consultation = $subject->getConsultation();
            if ($consultation) {
                $consultationId = $consultation->getId();
            }
        } else {
            $consultationId = $this->getRequest()->get('consultation_id');
        }

        return array(
            'consultation_id' => $consultationId,
        );
    }

    protected $datagridValues = array(
        '_sort_order' => 'ASC',
        '_sort_by' => 'title',
    );

    protected $formOptions = array(
        'cascade_validation' => true,
    );

    /**
     * @param FormMapper $formMapper
     */
    protected function configureFormFields(FormMapper $formMapper)
    {
        $subject = $this->getSubject();

        $consultationId = $this->getPersistentParameter('consultation_id');

        $formMapper
            ->add('title', null, array(
                'label' => 'admin.fields.step.title',
                'required' => true,
            ))
        ;

        $formMapper
            ->add('isEnabled', null, array(
                'label' => 'admin.fields.step.is_enabled',
                'required' => false,
            ))
            ->add('startAt', 'sonata_type_datetime_picker', array(
                'label' => 'admin.fields.step.start_at',
                'format' => 'dd/MM/yyyy HH:mm',
                'attr' => array(
                    'data-date-format' => 'DD/MM/YYYY HH:mm',
                ),
                'required' => false,
            ))
            ->add('endAt', 'sonata_type_datetime_picker', array(
                'label' => 'admin.fields.step.end_at',
                'format' => 'dd/MM/yyyy HH:mm',
                'attr' => array(
                    'data-date-format' => 'DD/MM/YYYY HH:mm',
                ),
                'required' => false,
            ))
        ;

        if ($subject instanceof PresentationStep || $subject instanceof OtherStep) {
            $formMapper
                ->add('body', 'ckeditor', array(
                    'config_name' => 'admin_editor',
                    'label' => 'admin.fields.step.body',
                    'required' => false,
                ))
            ;
        } elseif ($subject instanceof ConsultationStep) {
            $formMapper
                ->add('body', null, array(
                    'label' => 'admin.fields.step.body',
                    'required' => false,
                ))
                ->add('consultationType', 'sonata_type_model', array(
                    'label' => 'admin.fields.consultation.consultation_type',
                    'required' => false,
                    'mapped' => false,
                    'class' => 'Capco\AppBundle\Entity\ConsultationType',
                    'help' => 'admin.help.consultation.consultation_type',
                    'attr' => array('class' => 'consultation-type-js'),
                ))
                ->add('allowedTypes', 'sonata_type_model', array(
                    'label' => 'admin.fields.consultation.allowed_types',
                    'required' => false,
                    'multiple' => true,
                    'by_reference' => false,
                    'expanded' => true,
                ))
            ;
        } elseif ($subject instanceof SynthesisStep) {
            $formMapper
                ->add('body', 'ckeditor', array(
                    'config_name' => 'admin_editor',
                    'label' => 'admin.fields.step.body',
                    'required' => false,
                ))
                ->add('synthesis', 'sonata_type_admin', array(
                        'label' => 'admin.fields.step.synthesis',
                        'required' => true,
                ), ['link_parameters' => ['consultation_id']]
            );
        }
    }

    public function getTemplate($name)
    {
        if ($name == 'edit') {
            return 'CapcoAdminBundle:Step:edit.html.twig';
        }

        return parent::getTemplate($name);
    }

    protected function configureRoutes(RouteCollection $collection)
    {
        $collection->clearExcept(array('create', 'edit', 'delete'));
    }

    public function prePersist($step)
    {
        if ($step instanceof SynthesisStep) {
            $this->manageEmbeddedSynthesis($step);
        }
    }

    public function preUpdate($step)
    {
        if ($step instanceof SynthesisStep) {
            $this->manageEmbeddedSynthesis($step);
        }
    }

    protected function manageEmbeddedSynthesis($step)
    {
        // Cycle through each field
        foreach ($this->getFormFieldDescriptions() as $fieldName => $fieldDescription) {
            // detect embedded Admin that manage Synthesis
            if ($fieldDescription->getType() === 'sonata_type_admin' &&
                ($associationMapping = $fieldDescription->getAssociationMapping()) &&
                $associationMapping['targetEntity'] === 'Capco\AppBundle\Entity\Synthesis\Synthesis'
            ) {
                $getter = 'get'.$fieldName;
                $setter = 'set'.$fieldName;

                /** @var Synthesis $synthesis */
                $synthesis = $step->$getter();
                if ($synthesis) {
                    $this->getConfigurationPool()->getContainer()->get('capco.synthesis.synthesis_handler')->createOrUpdateElementsFromSource($synthesis);
                }
            }
        }
    }
}
