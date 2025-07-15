
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Package, AlertTriangle, CheckCircle, Database } from 'lucide-react';
import { WidgetProps } from '@/types/widgetTypes';
import { API_URL } from '@/config/sourceConfig';
import { fetchAnalyst } from '@/store/slices/analystslice';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '@/hooks/useAppSelector';
import { fetchCountry } from '@/store/slices/countryslice';

// Sample stock data
const downloadData = [
    { service_id: 11, url: `${API_URL}`, }
];


const Default_item_download: React.FC<WidgetProps> = ({
    formData,
    serviceId,
    serviceInfo
}) => {

    const matchedFile = downloadData.find(
        (item) => item.service_id === serviceInfo?.service_id
    );
    const downloadUrl = matchedFile?.url || '#';
    const analystState = useAppSelector(state => state.analyst);
    // analyst.data for data.
    const dispatch = useDispatch()
    useEffect(() => {
        dispatch(fetchAnalyst() as any)
        dispatch(fetchCountry() as any)
    }, [])

    // const getCountry = async (AnalystID) => {

    //     axios.get(`${API_URL}/hots_Tps/country/${AnalystID}`, {
    //         headers: {
    //             Authorization: `Bearer ${"tokek", userToken}`,
    //         },
    //     }).then((res) => {
    //         // console.log("selectCountry", res.data.results)
    //         setCountryList(res.data.results)
    //         getRegion(res.data.results[0].country_id)
    //         setCountry(res.data.results[0].country_id)
    //         getDistributor(res.data.results[0].country_id)

    //     })
    //         .catch((err) => {
    //             console.log("errorGetData", err)
    //             setCountryList([])
    //             setAnalyst()
    //             setCountry()
    //             setRegion()
    //             setRegionList([])
    //             setDistributor()
    //             setDistributorlist([])
    //             setPort()
    //             setPortlist([])
    //             setSku()
    //             setSkulist([])
    //         });

    // }

    // const getRegion = async (selectedCountry) => {

    //     axios.get(`${API_URL}/hots_Tps/region/${selectedCountry}`, {
    //         headers: {
    //             Authorization: `Bearer ${"tokek", userToken}`,
    //         },
    //     }).then((res) => {
    //         setRegionList(res.data.results)
    //         // console.log("results region", ` ${selectedCountry}`, res.data.results)
    //         setRegion(res.data.results[0].region_id)
    //     })
    //         .catch((err) => {
    //             console.err("errorGetData", err)
    //         });

    // }



    // const getDistributor = async (idcountry) => {

    //     axios.get(`${API_URL}/hots_Tps/distributor/${idcountry}`, {
    //         headers: {
    //             Authorization: `Bearer ${"tokek", userToken}`,
    //         },
    //     }).then((res) => {
    //         setDistributorlist(res.data.results)
    //         // console.log("results distributor", ` ${idcountry}`, res.data.results)
    //         setDistributor(res.data.results[0].company_id)
    //         getPort(res.data.results[0].company_id)
    //         getSKU(res.data.results[0].company_id)

    //     })
    //         .catch((err) => {
    //             console.err("errorGetData", err)
    //         });

    // }

    // const getPort = async (idcompany) => {

    //     axios.get(`${API_URL}/hots_Tps/port/${idcompany}`, {
    //         headers: {
    //             Authorization: `Bearer ${"tokek", userToken}`,
    //         },
    //     }).then((res) => {
    //         setPortlist(res.data.results)
    //         // console.log("results port", ` ${idcompany}`, res.data.results)
    //         setPort(res.data.results[0].harbour_id)
    //     })
    //         .catch((err) => {
    //             console.log("errorGetData", err)
    //         });

    // }


    return (
        <Card className="mb-6">
            <CardHeader className="h-auto">
                <div className="flex justify-between items-center w-full">

                    {/* Title and description on the left */}
                    <div className="flex flex-col text-left">
                        <div className="flex items-center space-x-2">
                            <Package className="w-5 h-5 text-blue-600" />
                            <CardTitle className="text-lg">
                                {serviceInfo && (
                                    <span>{serviceInfo.service_name}&nbsp;</span>
                                )}
                                File Template
                            </CardTitle>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                            This file template provides a standardized {serviceInfo && (
                                <span>{serviceInfo.service_name}&nbsp;</span>
                            )}format.
                        </p>
                    </div>

                    {/* Download button on the right */}
                    <div className="flex items-center">
                        <a
                            href={downloadUrl}
                            download
                            className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded transition ${matchedFile
                                ? 'bg-green-600 text-white hover:bg-green-700'
                                : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                }`}
                            {...(!matchedFile && { onClick: (e) => e.preventDefault() })}
                        >
                            Download
                        </a>
                    </div>

                </div>
            </CardHeader>

        </Card>
    );
};

export default Default_item_download;
