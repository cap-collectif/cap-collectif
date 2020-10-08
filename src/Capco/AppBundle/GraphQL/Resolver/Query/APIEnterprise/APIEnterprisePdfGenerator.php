<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query\APIEnterprise;

use Capco\AppBundle\Manager\MediaManager;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpFoundation\File\File;
use TCPDF;
use Twig\Environment;

class APIEnterprisePdfGenerator
{
    private MediaManager $mediaManager;
    private LoggerInterface $logger;
    private Environment $templating;

    public function __construct(
        MediaManager $mediaManager,
        LoggerInterface $logger,
        Environment $templating
    ) {
        $this->mediaManager = $mediaManager;
        $this->templating = $templating;
        $this->logger = $logger;
    }

    public function jsonToPdf(
        ?string $content,
        string $path,
        string $filename,
        $template = 'siretPdf'
    ): ?string {
        if (!$content) {
            return null;
        }

        try {
            $filenameWithExtension = $filename . '.pdf';
            $completePath = "${path}${filenameWithExtension}";

            $jsonToArray = json_decode($content);
            $html = $this->templating->render("@CapcoPDF/${template}.html.twig", [
                'data' => $jsonToArray,
            ]);

            $pdf = new TCPDF(PDF_PAGE_ORIENTATION, PDF_UNIT, PDF_PAGE_FORMAT, true, 'UTF-8', false);
            $pdf->AddPage();
            $pdf->writeHTML($html);
            if (!file_exists($path)) {
                if (!mkdir($path, 0777, true) && !is_dir($path)) {
                    throw new \RuntimeException(sprintf('Directory "%s" was not created', $path));
                }
            }
            $pdf->Output($completePath, 'F');
        } catch (\RuntimeException $exception) {
            $this->logger->error(
                'An error occured while creating a pdf: ' . $exception->getMessage()
            );

            return null;
        }

        return $this->mediaManager->createFileFromFile(new File($completePath), $filename)->getId();
    }

    public function urlToPdf(?string $url, string $path, string $filename): ?string
    {
        $filenameWithExtension = $filename . '.pdf';
        if (!$url) {
            return null;
        }
        if (!file_exists($path)) {
            if (!mkdir($path, 0777, true) && !is_dir($path)) {
                throw new \RuntimeException(sprintf('Directory "%s" was not created', $path));
            }
        }
        $completePath = "${path}${filenameWithExtension}";
        $copyResult = copy($url, $completePath);

        if (!$copyResult) {
            $this->logger->error(
                __METHOD__ .
                    ' : ' .
                    'An error occured while trying to 
            transform a distant document to local pdf at ' .
                    $completePath
            );

            return null;
        }

        return $this->mediaManager->createFileFromFile(new File($completePath), $filename)->getId();
    }
}
